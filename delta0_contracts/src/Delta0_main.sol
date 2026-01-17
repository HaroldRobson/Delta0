pragma solidity ^0.8.30;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {PrecompileLib} from "../lib/hyper-evm-lib/src/PrecompileLib.sol";
import {CoreWriterLib} from "../lib/hyper-evm-lib/src/CoreWriterLib.sol";
import {HLConversions} from "../lib/hyper-evm-lib/src/common/HLConversions.sol";

contract Delta0_main is ERC20 {
    uint32 public perpdexindex;
    uint32 public spotdexindex;
    address public TokenAddress;
    address public USDCAddress;
    address public RouterAddress;
    address public Owner;
    address public BBO_PRECOMPILE_ADDRESS;
    address public POSITION_PRECOMPILE_ADDRESS;
    address public ACCOUNT_MARGIN_SUMMARY_PRECOMPILE_ADDRESS;
    IERC20 public Token; // the token being hedged

    constructor(
        uint32 _perpdexindex,
        uint32 _spotdexindex, // often called "asset" in docs
        address _TokenAddress,
        address _USDCAddress,
        address owner,
        string memory Name,
        string memory Ticker
    ) ERC20(Name, Ticker) {
        perpdexindex = _perpdexindex;
        spotdexindex = _spotdexindex;
        TokenAddress = _TokenAddress; // adress of token being hedged
        USDCAddress = _USDCAddress;
        RouterAddress = msg.sender;
        Owner = owner;
        Token = IERC20(TokenAddress);
    }

    struct Bbo {
        uint64 bid;
        uint64 ask;
    }

    struct AccountMarginSummary {
        int64 accountValue;
        uint64 marginUsed;
        uint64 ntlPos;
        int64 rawUsd;
    }

    struct Position {
        int64 szi;
        uint64 entryNtl;
        int64 isolatedRawUsd;
        uint32 leverage;
        bool isIsolated;
    }

    modifier onlyOwner() {
        require(msg.sender == Owner);
        _;
    }

    modifier onlyRouter() {
        require(msg.sender == RouterAddress);
        _;
    }

    function position(address user, uint16 perp) public view returns (Position memory) {
        bool success;
        bytes memory result;
        (success, result) = POSITION_PRECOMPILE_ADDRESS.staticcall(abi.encode(user, perp));
        require(success, "Position precompile call failed");
        return abi.decode(result, (Position));
    }

    function getTokenBalance() public view returns (uint256) {
        return Token.balanceOf(address(this));
    }

    function accountMarginSummary() public view returns (AccountMarginSummary memory) {
        bool success;
        bytes memory result;
        (success, result) =
            ACCOUNT_MARGIN_SUMMARY_PRECOMPILE_ADDRESS.staticcall(abi.encode(perpdexindex, address(this)));
        require(success, "Account margin summary precompile call failed");
        return abi.decode(result, (AccountMarginSummary));
    }

    function totalUSDCValueUnderManagement() public view returns (uint256) {
        uint256 totalTokenOnEVM = getTokenBalance();
        AccountMarginSummary memory summary = accountMarginSummary();
        require(summary.rawUsd > 0, "rawUSD is negative!");
        uint64 coreValueInUSDC = uint64(summary.accountValue); // CHECK CONVERSION
        uint64 tokenIndex = PrecompileLib.getTokenIndex(TokenAddress);
        uint256 totalUSDCValueHeldInToken = totalTokenOnEVM * PrecompileLib.normalizedSpotPx(tokenIndex); // check if bid or ask
        return totalUSDCValueHeldInToken + coreValueInUSDC;
    }

    function hedge(address user, uint256 amount) public {
        Token.transferFrom(user, address(this), amount);
        uint64 tokenIndex = PrecompileLib.getTokenIndex(TokenAddress);
        uint256 USDCValueReceived = PrecompileLib.normalizedSpotPx(tokenIndex) * amount;
        if (totalSupply() != 0) {
            uint256 tokensToMint = USDCValueReceived * totalSupply() / totalUSDCValueUnderManagement();
            _mint(user, tokensToMint);
        } else {
            _mint(user, USDCValueReceived); // our tokens begin with a 1-1 USDC value, and increase over time with yield.
        }
    }

    function sendToHyperCore(uint256 amount) public onlyOwner {
        CoreWriterLib.bridgeToCore(TokenAddress, amount);
    }

    function takeFromHyperCore(uint256 amount) public onlyOwner {
        CoreWriterLib.bridgeToEvm(TokenAddress, amount);
    }

    function increaseCollateral() public onlyOwner {
        // sell all of the Token on HyperEVM and use all as collateral
        uint64 balance = PrecompileLib.spotBalance(address(this), TokenAddress).total;
        CoreWriterLib.placeLimitOrder(spotdexindex, false, 0, balance, false, 3, uint128(block.timestamp)); // limit Ask at price of 0 is basically a market sell.
        uint64 amount = PrecompileLib.spotBalance(address(this), USDCAddress).total;
        uint64 usdcPerpAmount = HLConversions.weiToPerp(amount);
        CoreWriterLib.transferUsdClass(usdcPerpAmount, true);
    }
}
