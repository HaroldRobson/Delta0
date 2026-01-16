pragma solidity ^0.8.30;
import "./Delta0_Proxy.sol";

contract Delta0_Router {
    mapping(address => address) TokenAddressToProxyAddress; // which proxy for which token

    function new_proxy(address Token) private {
        address proxy_address = new Delta0_Proxy();
    }
}
