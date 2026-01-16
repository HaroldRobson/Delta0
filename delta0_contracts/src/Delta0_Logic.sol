pragma solidity ^0.8.30;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract Delta0_Logic {
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

    function accountMargin() public view returns (AccountMarginSummary memory) {
        bool success;
        bytes memory result;
        (success, result) =
            ACCOUNT_MARGIN_SUMMARY_PRECOMPILE_ADDRESS.staticcall(abi.encode(perpdexindex, address(this)));
        require(success, "Account margin summary precompile call failed");
        return abi.decode(result, (AccountMarginSummary));
    }

    function TotalUSDCValueUnderManagement() public view returns (uint256) {
        uint256 totalTokenOnEVM = getTokenBalance();
        AccountMarginSummary memory summary = accountMarginSummary();
        uint64 totalUSDCOnCore = uint64(summary.rawUsd) * 1e6; // CHECK CONVERSION
        Bbo memory bestbidoffer = bbo();
        uint256 totalUSDCValueHeldInToken = totalTokenOnEVM * bestbidoffer.bid;
    }

    function hedge(uint256 amount) public {
        Token.transfer(address(this), amount);
    }
}
