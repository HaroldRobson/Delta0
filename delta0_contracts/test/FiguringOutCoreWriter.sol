// SPDX-License-Identifier: MIT

pragma solidity ^0.8.30;

import {Test} from "../lib/forge-std/src/Test.sol";
import {console} from "../lib/forge-std/src/console.sol";
import {HyperCore} from "../lib/hyper-evm-lib/test/simulation/HyperCore.sol";
import {CoreSimulatorLib} from "../lib/hyper-evm-lib/test/simulation/CoreSimulatorLib.sol";
import {CoreWriterLib} from "../lib/hyper-evm-lib/src/CoreWriterLib.sol";
import {PrecompileLib} from "../lib/hyper-evm-lib/src/PrecompileLib.sol";
import {HLConversions} from "../lib/hyper-evm-lib/src/common/HLConversions.sol";
import {HLConstants} from "../lib/hyper-evm-lib/src/common/HLConstants.sol";
import {L1Read} from "./utils/L1Read.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract FiguringOutCoreWriter is Test {
    HyperCore hyperCore;
    L1Read l1Read;

    uint16 constant ETH_PERP = 1;
    address constant ETH_HYPER_EVM = 0xBe6727B535545C67d5cAa73dEa54865B92CF7907;
    address constant USDC_HYPER_EVM = 0xb88339CB7199b77E23DB6E890353E22632Ba630f;
    address constant SOL_HYPER_EVM = 0x068f321Fa8Fb9f0D135f290Ef6a3e2813e1c8A29;

    address user = makeAddr("user");

    function setUp() public {
        vm.createSelectFork("https://rpc.hyperliquid.xyz/evm");

        hyperCore = CoreSimulatorLib.init();
        l1Read = new L1Read();

        CoreSimulatorLib.forceAccountActivation(user);
        //CoreSimulatorLib.forcePerpBalance(user, 1000000e6);

        //        CoreSimulatorLib.forcePerpLeverage(user, ETH_PERP, 10);
    }

    function test_Open_short_and_read_margin_summary() public {
        CoreSimulatorLib.forcePerpBalance(user, 1000e8); // 1000 dollars
        CoreSimulatorLib.setMarkPx(ETH_PERP, PrecompileLib.markPx(ETH_PERP));
        console.log("markpx: ", PrecompileLib.markPx(ETH_PERP));
        console.log("spotpx: ", PrecompileLib.spotPx(ETH_HYPER_EVM));

        L1Read.AccountMarginSummary memory beforeSummary = l1Read.accountMarginSummary(ETH_PERP, user);

        emit log_named_int("before.accountValue", beforeSummary.accountValue);
        console.log(
            "account value after wei to evm conersion", HLConversions.weiToEvm(0, uint64(beforeSummary.accountValue))
        );
        emit log_named_uint("before.marginUsed", beforeSummary.marginUsed);
        emit log_named_uint("before.ntlPos", beforeSummary.ntlPos);
        emit log_named_int("before.rawUsd", beforeSummary.rawUsd);

        uint64 perpAmountUSDC = PrecompileLib.markPx(ETH_PERP) * 100000;
        console.log("perp amount USDC: ", perpAmountUSDC); // the ACTUAL PRICE IN USDC OF 1 ETH???
        vm.startPrank(user);
        CoreWriterLib.placeLimitOrder(ETH_PERP, false, 0, perpAmountUSDC, false, HLConstants.LIMIT_ORDER_TIF_IOC, 1);
        vm.stopPrank();

        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();

        L1Read.AccountMarginSummary memory afterSummary = l1Read.accountMarginSummary(ETH_PERP, user);

        emit log_named_int("after.accountValue", afterSummary.accountValue);
        emit log_named_uint("after.marginUsed", afterSummary.marginUsed);
        emit log_named_uint("after.ntlPos", afterSummary.ntlPos);
        emit log_named_int("after.rawUsd", afterSummary.rawUsd);
        console.log("actual USDC collateral", (afterSummary.rawUsd - int64(afterSummary.ntlPos)) / 1e2);
        PrecompileLib.Position memory pos = PrecompileLib.position(user, ETH_PERP);

        console.log("--- Position Details ---");
        console.log("Size (szi):", int256(pos.szi));
        console.log("Entry Notional:", uint256(pos.entryNtl));
        console.log("Isolated Raw USD:", int256(pos.isolatedRawUsd));
        console.log("Leverage:", uint256(pos.leverage));
        console.log("Is Isolated:", pos.isIsolated);

        console.log("after.leverage", PrecompileLib.position(address(user), ETH_PERP).leverage);

        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();

        L1Read.AccountMarginSummary memory afterafterSummary = l1Read.accountMarginSummary(ETH_PERP, user);
        console.log("after.ntlPos, a few blocks later", afterafterSummary.ntlPos);
        emit log_named_int("afterafter.accountValue", afterafterSummary.accountValue);
        emit log_named_uint("afterafter.marginUsed", afterafterSummary.marginUsed);
        emit log_named_uint("afterafter.ntlPos", afterafterSummary.ntlPos);
        emit log_named_int("afterafter.rawUsd", afterafterSummary.rawUsd);
        console.log("actual USDC collateral", (afterafterSummary.rawUsd - int64(afterafterSummary.ntlPos)) / 1e2);
    }

    function test_transferUsdcBetweenSpotAndPerp() external {
        // transfer one ETH, then short 9
        CoreSimulatorLib.setMarkPx(ETH_PERP, PrecompileLib.markPx(ETH_PERP));
        console.log("ETH PRICE", PrecompileLib.markPx(ETH_PERP));
        CoreSimulatorLib.forceSpotBalance(user, 0, 1 * PrecompileLib.markPx(ETH_PERP) * 1e8);
        CoreSimulatorLib.forcePerpLeverage(user, ETH_PERP, 50);
        uint64 usdcPerpAmount = HLConversions.weiToPerp(1 * PrecompileLib.markPx(ETH_PERP) * 1e8);

        L1Read.AccountMarginSummary memory beforeSummary = l1Read.accountMarginSummary(ETH_PERP, user);
        emit log_named_int("before.accountValue", beforeSummary.accountValue);
        emit log_named_uint("before.marginUsed", beforeSummary.marginUsed);
        emit log_named_uint("before.ntlPos", beforeSummary.ntlPos);
        emit log_named_int("before.rawUsd", beforeSummary.rawUsd);
        console.log("before isolatedrawUSD", PrecompileLib.position(user, ETH_PERP).isolatedRawUsd);

        vm.startPrank(user);
        CoreWriterLib.transferUsdClass(usdcPerpAmount, true);
        vm.stopPrank();

        vm.startPrank(user);
        CoreWriterLib.placeLimitOrder(ETH_PERP, false, 0, 9 * 1e9, false, HLConstants.LIMIT_ORDER_TIF_IOC, 1);
        CoreSimulatorLib.nextBlock();
        vm.stopPrank();

        L1Read.AccountMarginSummary memory afterSummary = l1Read.accountMarginSummary(ETH_PERP, user);

        emit log_named_int("after.accountValue", afterSummary.accountValue);
        emit log_named_uint("after.marginUsed", afterSummary.marginUsed);
        emit log_named_uint("after.ntlPos", afterSummary.ntlPos);
        emit log_named_int("after.rawUsd", afterSummary.rawUsd);
        console.log("after isolatedrawUSD", PrecompileLib.position(user, ETH_PERP).isolatedRawUsd);
    }

    function test_transferEVMToCoreThenExchange_2() external {
        uint64 UETH_INDEX = 221;

        // 1. WARM UP: Force the simulator to fetch token metadata from RPC
        // This ensures the simulator knows exactly how to handle the decimals
        PrecompileLib.tokenInfo(uint32(UETH_INDEX));

        // 2. Fund the user on EVM
        deal(ETH_HYPER_EVM, user, 10e18);

        vm.startPrank(user);

        // 3. THE FIX: Pass the INDEX (221), NOT the address
        // This will correctly generate the system address 0x20...00dd
        CoreWriterLib.bridgeToCore(UETH_INDEX, 1e18);

        vm.stopPrank();

        // 4. PROCESS: The simulator indexer now 'sees' the transfer to 0x20...dd
        CoreSimulatorLib.nextBlock();

        // 5. VERIFY: UETH has 9 weiDecimals on Core.
        // 1e18 (EVM) / 10^9 (Extra Decimals) = 1,000,000,000 (L1 Wei)
        uint64 l1Balance = PrecompileLib.spotBalance(user, UETH_INDEX).total;
        console.log("ETH balance on HyperCore L1:", l1Balance);

        //require(l1Balance == 1e9, "Bridge failed: L1 balance is still 0");
    }

    function test_transferEVMToCoreThenExchange() external {
        deal(ETH_HYPER_EVM, user, 1e18);
        vm.startPrank(user);
        console.log(IERC20(ETH_HYPER_EVM).balanceOf(user));
        console.log("user addres:", user);
        //        IERC20(ETH_HYPER_EVM).transfer(0x20000000000000000000000000000000000000e3, 1e18);
        CoreWriterLib.bridgeToCore(ETH_HYPER_EVM, 1e18);
        //IERC20(ETH_HYPER_EVM).transfer(0x20000000000000000000000000000000000000dD, 1e18);
        vm.stopPrank();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        console.log("ETH balance on HyperCore", PrecompileLib.spotBalance(user, 151).total);
        console.log("ETH balance on HyperCore", PrecompileLib.spotBalance(user, 235).total);

        L1Read.AccountMarginSummary memory beforeSummary = l1Read.accountMarginSummary(ETH_PERP, user);
        emit log_named_int("before.accountValue", beforeSummary.accountValue);
        emit log_named_uint("before.marginUsed", beforeSummary.marginUsed);
        emit log_named_uint("before.ntlPos", beforeSummary.ntlPos);
        emit log_named_int("before.rawUsd", beforeSummary.rawUsd);
    }

    function test_transferSOLToCoreThenExchange() external {
        deal(SOL_HYPER_EVM, user, 1e18);
        vm.startPrank(user);
        console.log(IERC20(SOL_HYPER_EVM).balanceOf(user));
        console.log("user addres:", user);
        //        IERC20(ETH_HYPER_EVM).transfer(0x20000000000000000000000000000000000000e3, 1e18);
        //        CoreWriterLib.bridgeToCore(221, 1e18);
        //IERC20(ETH_HYPER_EVM).transfer(0x20000000000000000000000000000000000000dD, 1e18);
        CoreWriterLib.bridgeToCore(SOL_HYPER_EVM, 1e18);
        vm.stopPrank();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        console.log("ETH balance on HyperCore", PrecompileLib.spotBalance(user, 254).total);

        L1Read.AccountMarginSummary memory beforeSummary = l1Read.accountMarginSummary(ETH_PERP, user);
        emit log_named_int("before.accountValue", beforeSummary.accountValue);
        emit log_named_uint("before.marginUsed", beforeSummary.marginUsed);
        emit log_named_uint("before.ntlPos", beforeSummary.ntlPos);
        emit log_named_int("before.rawUsd", beforeSummary.rawUsd);
    }

    function test_transferUSDCToCore() external {
        deal(USDC_HYPER_EVM, user, 1e18);
        vm.startPrank(user);
        console.log(IERC20(USDC_HYPER_EVM).balanceOf(user));
        console.log("user addres:", user);
        //        IERC20(ETH_HYPER_EVM).transfer(0x20000000000000000000000000000000000000e3, 1e18);
        CoreWriterLib.bridgeToCore(0, 1e12);
        vm.stopPrank();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        console.log("USDC balance on HyperCore", PrecompileLib.spotBalance(user, 227).total);

        L1Read.AccountMarginSummary memory beforeSummary = l1Read.accountMarginSummary(ETH_PERP, user);
        emit log_named_int("before.accountValue", beforeSummary.accountValue);
        emit log_named_uint("before.marginUsed", beforeSummary.marginUsed);
        emit log_named_uint("before.ntlPos", beforeSummary.ntlPos);
        emit log_named_int("before.rawUsd", beforeSummary.rawUsd);
    }
}
