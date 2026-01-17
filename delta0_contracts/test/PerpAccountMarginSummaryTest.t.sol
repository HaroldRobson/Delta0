// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {HyperCore} from "@hyper-evm-lib/test/simulation/HyperCore.sol";
import {CoreSimulatorLib} from "@hyper-evm-lib/test/simulation/CoreSimulatorLib.sol";
import {CoreWriterLib} from "@hyper-evm-lib/src/CoreWriterLib.sol";
import {PrecompileLib} from "@hyper-evm-lib/src/PrecompileLib.sol";
import {HLConstants} from "@hyper-evm-lib/src/common/HLConstants.sol";
import {L1Read} from "./utils/L1Read.sol";


contract PerpAccountMarginSummaryTest is Test {
    HyperCore hyperCore;
    L1Read l1Read;

    uint16 constant ETH_PERP = 1;

    address user = makeAddr("user");

    function setUp() public {
        vm.createSelectFork("https://rpc.hyperliquid.xyz/evm");
        
        hyperCore = CoreSimulatorLib.init();
        l1Read = new L1Read();

        CoreSimulatorLib.forceAccountActivation(user);
        CoreSimulatorLib.forcePerpBalance(user, 100e6);
        CoreSimulatorLib.forcePerpLeverage(user, ETH_PERP, 10);
    }

    function test_Open_short_and_read_margin_summary() public {
        CoreSimulatorLib.setMarkPx(
            ETH_PERP,
            PrecompileLib.markPx(ETH_PERP)
        );

        L1Read.AccountMarginSummary memory beforeSummary = 
            l1Read.accountMarginSummary(ETH_PERP, user);

        emit log_named_int("before.accountValue", beforeSummary.accountValue);
        emit log_named_uint("before.marginUsed", beforeSummary.marginUsed);
        emit log_named_uint("before.ntlPos", beforeSummary.ntlPos);
        emit log_named_int("before.rawUsd", beforeSummary.rawUsd);


        vm.startPrank(user);
        CoreWriterLib.placeLimitOrder(
            ETH_PERP,
            false,
            0,
            1e8,
            false,
            HLConstants.LIMIT_ORDER_TIF_IOC,
            1
        );
        vm.stopPrank();

        CoreSimulatorLib.nextBlock();

        L1Read.AccountMarginSummary memory afterSummary = 
            l1Read.accountMarginSummary(ETH_PERP, user);

        
        emit log_named_int("after.accountValue", afterSummary.accountValue);
        emit log_named_uint("after.marginUsed", afterSummary.marginUsed);
        emit log_named_uint("after.ntlPos", afterSummary.ntlPos);
        emit log_named_int("after.rawUsd", afterSummary.rawUsd);


        

    }



}


