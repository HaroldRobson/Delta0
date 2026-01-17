pragma solidity ^0.8.30;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract Delta0_Logic is ERC20 {
    uint32 public asset;
    uint32 public perpdexindex;
    address public TokenAddress;
    address public LogicAddress;
    address public RouterAddress;
    address public Owner;
    address public BBO_PRECOMPILE_ADDRESS;
    address public POSITION_PRECOMPILE_ADDRESS;
    address public ACCOUNT_MARGIN_SUMMARY_PRECOMPILE_ADDRESS;
    IERC20 public Token; // the token being hedged

    constructor(
        address _LogicAddress,
        address _TokenAddress,
        address owner,
        string memory Name,
        string memory Ticker,
        uint32 _asset
    ) ERC20(Name, Ticker) {
        asset = _asset;
        TokenAddress = _TokenAddress; // adress of token being hedged
        LogicAddress = _LogicAddress;
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

    function bbo() public view returns (Bbo memory) {
        bool success;
        bytes memory result;
        (success, result) = BBO_PRECOMPILE_ADDRESS.staticcall(abi.encode(asset));
        require(success, "Bbo precompile call failed");
        return abi.decode(result, (Bbo));
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
        uint256 totalUSDCValueHeldInToken = totalTokenOnEVM * bbo().bid; // check if bid or ask
        return totalUSDCValueHeldInToken + coreValueInUSDC;
    }

    function hedge(address user, uint256 amount) public {
        Token.transferFrom(user, address(this), amount);
        uint256 USDCValueReceived = bbo().bid * amount;
        if (totalSupply() != 0) {
            uint256 tokensToMint = USDCValueReceived * totalSupply() / totalUSDCValueUnderManagement();
            _mint(user, tokensToMint);
        } else {
            _mint(user, USDCValueReceived); // our tokens begin with a 1-1 USDC value, and increase over time with yield.
        }
    }

    function sendToHyperCore(uint256 amount) external onlyOwner {}
    function takeFromHyperCore(uint256 amount) external onlyOwner {}
}
