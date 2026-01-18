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
import {Delta0_ETH} from "../src/Delta0_ETH.sol";

contract PerpAccountMarginSummaryTest is Test {
    HyperCore hyperCore;
    L1Read l1Read;

    uint16 constant ETH_PERP = 1;
    address constant ETH_HYPER_EVM = 0xBe6727B535545C67d5cAa73dEa54865B92CF7907;
    address constant USDC_HYPER_EVM = 0xb88339CB7199b77E23DB6E890353E22632Ba630f;
    address constant SOL_HYPER_EVM = 0x068f321Fa8Fb9f0D135f290Ef6a3e2813e1c8A29;
    Delta0_ETH public delta0_ETH;

    address user = makeAddr("user");
    address owner = makeAddr("owner");

    function setUp() public {
        vm.createSelectFork("https://rpc.hyperliquid.xyz/evm", 24540454);

        hyperCore = CoreSimulatorLib.init();
        l1Read = new L1Read();

        CoreSimulatorLib.forceAccountActivation(user);
        vm.startPrank(owner);
        delta0_ETH = new Delta0_ETH("Delta0_ETH", "D0ETH");
        //CoreSimulatorLib.forcePerpBalance(user, 1000000e6);
        vm.stopPrank();

        CoreSimulatorLib.forceAccountActivation(address(delta0_ETH));
        CoreSimulatorLib.forceSpotBalance(address(delta0_ETH), 150, 200000000000000);
        //        CoreSimulatorLib.forcePerpLeverage(user, ETH_PERP, 10);
    }

    function test_deposit() public {
        deal(ETH_HYPER_EVM, user, 1e18);

        vm.startPrank(user);
        IERC20(ETH_HYPER_EVM).approve(address(delta0_ETH), 1e18);
        delta0_ETH.deposit(1e18);
        vm.stopPrank();

        console.log(delta0_ETH.balanceOf(user)); // works - we use 18 decimals.
        console.log("value locked by user", delta0_ETH.valueLockedByUser(user));
        console.log("TotalUSDC Value stored in token on EVM", delta0_ETH.totalUSDCValueStoredInToken());
        console.log("Total USDC AUM", delta0_ETH.totalUSDCValueUnderManagement());
    }

    function test_accounting() public {
        deal(ETH_HYPER_EVM, address(delta0_ETH), 1e18);
        CoreSimulatorLib.forcePerpBalance(address(delta0_ETH), 1000e8);
        CoreSimulatorLib.setMarkPx(ETH_PERP, PrecompileLib.markPx(ETH_PERP));

        uint64 perpAmountUSDC = PrecompileLib.markPx(ETH_PERP) * 100000; // short 1 ETH
        console.log("perp amount USDC: ", perpAmountUSDC);
        vm.startPrank(address(delta0_ETH));
        CoreWriterLib.placeLimitOrder(ETH_PERP, false, 0, perpAmountUSDC, false, HLConstants.LIMIT_ORDER_TIF_IOC, 1);
        vm.stopPrank();

        CoreSimulatorLib.nextBlock();
        console.log("amount short", delta0_ETH.amountShortOnHyperCore());
        console.log("amount long", delta0_ETH.amountLongOnHyperEVM());
        vm.startPrank(owner);
        console.log("USDC on HyperCore", delta0_ETH.coreValueUSDC());
        console.log("target leverage is 1: 1");
        (uint256 rv, uint256 rv2, bool unused) = delta0_ETH.rebalance(1, 1);
        console.log("thingy", rv);
        console.log("thingy2", rv2);
        vm.stopPrank();
    }

    function test_accounting_2() public {
        deal(ETH_HYPER_EVM, address(delta0_ETH), 1e18);
        deal(address(delta0_ETH), owner, 3300 * 1e6, true);
        console.log("value of token USDC ", delta0_ETH.valueOfTokenUsdc());
    }

    function test_comprehensive() public {
        uint64 markPx = PrecompileLib.markPx(ETH_PERP);
        CoreSimulatorLib.setMarkPx(ETH_PERP, markPx);
        console.log("markPx", markPx);
        deal(ETH_HYPER_EVM, address(delta0_ETH), 8e17); // 0.8 ETH long
        deal(address(delta0_ETH), owner, markPx * 1e4, true);
        CoreSimulatorLib.forcePerpBalance(address(delta0_ETH), markPx * 2e5); // 20% as collateral
        vm.startPrank(address(delta0_ETH));
        CoreWriterLib.placeLimitOrder(ETH_PERP, false, 0, markPx * 8e4, false, 3, 69);
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        console.log("amount short", delta0_ETH.amountShortOnHyperCore());
        console.log("amount long", delta0_ETH.amountLongOnHyperEVM());
        uint256 L_0 = delta0_ETH.amountLongOnHyperEVM();
        console.log("USDC on HyperCore", delta0_ETH.coreValueUSDC());
        console.log("USDC AUM", delta0_ETH.totalUSDCValueUnderManagement());
        console.log("value of token USDC ", delta0_ETH.valueOfTokenUsdc());
        vm.stopPrank();

        vm.startPrank(user);
        vm.stopPrank();

        console.log("target leverage is 3: 1");
        uint64 markPx2 = PrecompileLib.markPx(ETH_PERP);
        CoreSimulatorLib.setMarkPx(ETH_PERP, markPx2);
        vm.startPrank(owner);
        CoreSimulatorLib.forceSpotBalance(address(delta0_ETH), 221, 100000); // this number was emitted by contract below.
        (uint256 rv, uint256 rv2, bool nextRebisA) = delta0_ETH.rebalance(3, 1);
        console.log("stuff from first rebalancing tail", rv, rv2, nextRebisA);

        CoreSimulatorLib.nextBlock();
        CoreSimulatorLib.nextBlock();
        (uint256 rva, uint256 rv2a, bool nextREBisA) = delta0_ETH.rebalance(3, 1); // the second tail of rebalancing.
        console.log("stuff from second rebalancing tail, ", rva, rv2a, nextREBisA);
        CoreSimulatorLib.nextBlock();
        uint256 USDClongDelta = L_0 - delta0_ETH.amountLongOnHyperEVM();
        console.log("USDC value of ETH reduced, ", USDClongDelta);
        console.log("USDC on HyperCore", delta0_ETH.coreValueUSDC());
        console.log("amount short", delta0_ETH.amountShortOnHyperCore());
        console.log("amount long", delta0_ETH.amountLongOnHyperEVM());
        console.log("USDC AUM", delta0_ETH.totalUSDCValueUnderManagement());
        console.log("value of token USDC ", delta0_ETH.valueOfTokenUsdc());
    }

    function test_withdrawal_curve() public {
        deal(ETH_HYPER_EVM, user, 1e18);

        vm.startPrank(user);
        IERC20(ETH_HYPER_EVM).approve(address(delta0_ETH), 1e18);
        delta0_ETH.deposit(1e18);
        vm.stopPrank();

        console.log(delta0_ETH.balanceOf(user)); // works - we use 18 decimals.
        uint256 userbalance = delta0_ETH.balanceOf(user);
        deal(address(delta0_ETH), owner, 1 * userbalance, true);

        CoreSimulatorLib.forcePerpBalance(address(delta0_ETH), 200 * 1e8);

        console.log(
            "withdrawal multiplier for a tenth of user balance:", delta0_ETH.withdrawalMultiplier(userbalance / 10)
        );
        console.log("withdrawal multiplier for a half", delta0_ETH.withdrawalMultiplier(userbalance / 2));
        console.log("withdrawal multiplier for a whole", delta0_ETH.withdrawalMultiplier(userbalance));
        console.log("withdrawal multiplier for 1.2", delta0_ETH.withdrawalMultiplier(userbalance * 12 / 10));

        deal(address(delta0_ETH), owner, 10 * userbalance, true);
        // these are much higher since the user is withdrawing a lower propotion

        console.log(
            "withdrawal multiplier for a tenth of user balance:", delta0_ETH.withdrawalMultiplier(userbalance / 10)
        );
        console.log("withdrawal multiplier for a half", delta0_ETH.withdrawalMultiplier(userbalance / 2));
        console.log("withdrawal multiplier for a whole", delta0_ETH.withdrawalMultiplier(userbalance));
        console.log("withdrawal multiplier for 1.2", delta0_ETH.withdrawalMultiplier(userbalance * 12 / 10));
        vm.startPrank(owner);
        delta0_ETH.rebalance(100, 100);
    }
}
