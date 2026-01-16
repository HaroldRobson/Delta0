pragma solidity ^0.8.30;
import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract Delta0_Proxy is ERC20 {
    uint32 public asset;
    address public TokenAddress;
    address public LogicAddress;
    address public RouterAddress;
    address public Owner;
    address public BBO_PRECOMPILE_ADDRESS = 0x000000000000000000000000000000000000080e;
    address public POSITION_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000800;
    address constant ACCOUNT_MARGIN_SUMMARY_PRECOMPILE_ADDRESS = 0x000000000000000000000000000000000000080F;
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

    function _delegate() private {
        (bool ok,) = LogicAddress.delegatecall(msg.data);
        require(ok, "delegatecall failed");
    }

    fallback() external payable {
        _delegate();
    }

    receive() external payable {
        _delegate();
    }

    function setLogicAddress(address _LogicAddress) external {
        LogicAddress = _LogicAddress;
    }
}
