pragma solidity ^0.8.30;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {PrecompileLib} from "../lib/hyper-evm-lib/src/PrecompileLib.sol";
import {CoreWriterLib} from "../lib/hyper-evm-lib/src/CoreWriterLib.sol";
import {HLConversions} from "../lib/hyper-evm-lib/src/common/HLConversions.sol";
import {HLConstants} from "../lib/hyper-evm-lib/src/common/HLConstants.sol";
import {SignedMath} from "../lib/openzeppelin-contracts/contracts/utils/math/SignedMath.sol";

import {console} from "../lib/forge-std/src/console.sol";

// ============ EVM Token Decimals ============
// Standard ERC20 tokens on EVM use 18 decimals
// Source: Ethereum ERC20 standard
uint256 constant EVM_PRECISION = 1e18;

// ============ Hyperliquid USDC Conversions ============
// weiToPerp divides by 1e2, perpToWei multiplies by 1e2
// USDC on perp margin has 2 fewer decimals than spot USDC
// Source: https://github.com/hyperliquid-dev/hyper-evm-lib HLConversions.sol
uint256 constant HL_USDC_PERP_PRECISION = 1e2;

// ============ Basis Points ============
// Used for expressing percentages: 10000 = 100%, 5000 = 50%, 100 = 1%
// Convention used in withdrawalMultiplier() and yieldMultiplier()
uint256 constant BASIS_POINTS_DIVISOR = 1e4;

// ============ Derived Conversion Constants ============
// Converting USDC(6 dec) to token wei using raw markPx:
// token_wei = USDC_6dec * EVM_PRECISION * ETH_MARK_PX_SCALE / USDC_INTERNAL_PRECISION / markPx
//           = USDC_6dec * 1e18 * 1e2 / 1e6 / markPx
//           = USDC_6dec * 1e14 / markPx
// Source: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm/interacting-with-hypercore
uint256 constant USDC_TO_TOKEN_FACTOR = 1e14;

// Converting token wei to USDC(6 dec) using raw markPx:
// USDC_6dec = token_wei * markPx / USDC_TO_TOKEN_FACTOR
uint256 constant TOKEN_TO_USDC_DIVISOR = 1e14;

// ============ ETH-Specific Constants (szDecimals = 4) ============
// These values are specific to ETH trading on Hyperliquid
// szDecimals = max decimal places for order sizes
// Source: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size
// For other assets, these would differ (e.g., BTC szDecimals = 5)

// Short size scaling: 10 = 10^(szDecimals - 3) for ETH
// Used in increaseShortSize/decreaseShortSize
uint256 constant ETH_SHORT_SIZE_SCALE = 10;

// Position to USDC conversion: 1e3 = 10^(szDecimals - 1) for ETH
// Used in amountShortOnHyperCore to convert szi to USDC value
uint256 constant ETH_POSITION_TO_USDC_SCALE = 1e3;

// CoreWriter order size divisor: 1e8 = 10^(szDecimals + 4) for ETH
// Used when placing limit orders via CoreWriterLib
uint256 constant ETH_ORDER_SIZE_DIVISOR = 1e8;

// Decrease collateral divisor: 1e7 for converting USDC amounts
// Used in decreaseCollateral for perp USDC amount calculation
uint256 constant ETH_DECREASE_COLLATERAL_DIVISOR = 1e7;

// Bridge amount scaling: 1e9 for spot balance to bridge amount
// Used in rebalanceB when bridging tokens back to EVM
uint256 constant ETH_BRIDGE_AMOUNT_SCALE = 1e9;

contract Delta0_ETH is ERC20 {
    uint32 constant perpdexindex = 1;
    uint32 constant spotdexindex = 10221;
    uint32 constant tokenindex = 221;
    address constant TokenAddress = 0xBe6727B535545C67d5cAa73dEa54865B92CF7907; // UETH
    address constant USDCAddress = 0xb88339CB7199b77E23DB6E890353E22632Ba630f;
    address public RouterAddress;
    address public Owner;
    address public BBO_PRECOMPILE_ADDRESS;
    address public POSITION_PRECOMPILE_ADDRESS;
    address public ACCOUNT_MARGIN_SUMMARY_PRECOMPILE_ADDRESS;
    IERC20 public Token; // the token being hedged

    constructor(string memory Name, string memory Ticker) ERC20(Name, Ticker) {
        Owner = msg.sender;
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

    function position(
        address user,
        uint16 perp
    ) public view returns (Position memory) {
        bool success;
        bytes memory result;
        (success, result) = POSITION_PRECOMPILE_ADDRESS.staticcall(
            abi.encode(user, perp)
        );
        require(success, "Position precompile call failed");
        return abi.decode(result, (Position));
    }

    function getTokenBalance() public view returns (uint256) {
        return Token.balanceOf(address(this));
    }

    function accountMarginSummary()
        public
        view
        returns (AccountMarginSummary memory)
    {
        bool success;
        bytes memory result;
        (success, result) = ACCOUNT_MARGIN_SUMMARY_PRECOMPILE_ADDRESS
            .staticcall(abi.encode(perpdexindex, address(this)));
        require(success, "Account margin summary precompile call failed");
        return abi.decode(result, (AccountMarginSummary));
    }

    function totalUSDCValueUnderManagement() public view returns (uint256) {
        uint256 totalTokenOnEVM = IERC20(TokenAddress).balanceOf(address(this));
        uint64 coreValueInUSDC = uint64(
            PrecompileLib
                .accountMarginSummary(perpdexindex, address(this))
                .accountValue
        ) / uint64(HL_USDC_PERP_PRECISION);
        uint256 totalUSDCValueHeldInToken = (totalTokenOnEVM *
            PrecompileLib.normalizedMarkPx(perpdexindex)) / EVM_PRECISION;
        uint256 totalUSDCAUM = totalUSDCValueHeldInToken + coreValueInUSDC;
        return totalUSDCAUM;
    }

    function yieldMultiplier() public view returns (uint256) {
        // in basis points so divide by BASIS_POINTS_DIVISOR
        uint256 totalTokenOnEVM = IERC20(TokenAddress).balanceOf(address(this));
        uint256 totalUSDCValueHeldInToken = (totalTokenOnEVM *
            PrecompileLib.normalizedMarkPx(perpdexindex)) / EVM_PRECISION;
        return
            (totalUSDCValueHeldInToken * BASIS_POINTS_DIVISOR) /
            totalUSDCValueUnderManagement();
    }

    function valueLockedByUser(address user) public view returns (uint256) {
        return
            (balanceOf(user) * totalUSDCValueUnderManagement()) / totalSupply();
    }

    function valueOfTokenUsdc() public view returns (uint256) {
        return (1e6 * totalUSDCValueUnderManagement()) / totalSupply();
    }

    function deposit(uint256 amount) public {
        address user = msg.sender;
        Token.transferFrom(user, address(this), amount);
        // Changed from 1e12 to EVM_PRECISION to match totalUSDCValueUnderManagement() precision
        uint256 USDCValueReceived = (PrecompileLib.normalizedMarkPx(
            perpdexindex
        ) * amount) / EVM_PRECISION;
        if (totalSupply() != 0) {
            uint256 tokensToMint = (USDCValueReceived * totalSupply()) /
                totalUSDCValueUnderManagement();
            _mint(user, tokensToMint);
        } else {
            _mint(user, USDCValueReceived); // our tokens begin with a 1-1 USDC value, and increase over time with yield.
        }
    }

    function withdraw(uint256 amount) public {
        address user = msg.sender;
        IERC20(TokenAddress).transfer(
            user,
            ((valueLockedByUser(user) *
                withdrawalMultiplier(amount) *
                amount *
                EVM_PRECISION) / balanceOf(user)) /
                (PrecompileLib.normalizedMarkPx(perpdexindex) *
                    BASIS_POINTS_DIVISOR)
        );
        _burn(user, amount);
    }

    function totalUSDCValueStoredInToken() public view returns (uint256) {
        uint256 totalTokenOnEVM = IERC20(TokenAddress).balanceOf(address(this));
        return
            (totalTokenOnEVM * PrecompileLib.normalizedMarkPx(perpdexindex)) /
            EVM_PRECISION;
    }

    function coreValueUSDC() public view returns (uint64) {
        return
            uint64(
                PrecompileLib
                    .accountMarginSummary(perpdexindex, address(this))
                    .accountValue
            ) / uint64(HL_USDC_PERP_PRECISION);
    }

    function withdrawalMultiplier(
        uint256 amount
    ) public view returns (uint256) {
        // in basis points so divide by BASIS_POINTS_DIVISOR
        uint256 totalTokenOnEVM = IERC20(TokenAddress).balanceOf(address(this));
        uint256 totalUSDCValueHeldInToken = (totalTokenOnEVM *
            PrecompileLib.normalizedMarkPx(perpdexindex)) / EVM_PRECISION;
        uint64 coreValueInUSDC = coreValueUSDC();
        return
            uint256(
                SignedMath.max(
                    SignedMath.min(
                        int256(
                            (totalUSDCValueHeldInToken *
                                totalSupply() *
                                BASIS_POINTS_DIVISOR) /
                                (coreValueInUSDC + totalUSDCValueHeldInToken) /
                                amount
                        ) - int256(BASIS_POINTS_DIVISOR),
                        int256(BASIS_POINTS_DIVISOR)
                    ),
                    0
                )
            );
    }

    function sendToHyperCore(uint256 amount) public onlyOwner {
        CoreWriterLib.bridgeToCore(TokenAddress, amount);
    }

    function takeFromHyperCore(uint256 amount) public onlyOwner {
        CoreWriterLib.bridgeToEvm(TokenAddress, amount);
    }

    function increaseCollateral(uint256 amount) internal returns (uint256) {
        uint256 AmountToSell = (amount * USDC_TO_TOKEN_FACTOR) /
            PrecompileLib.markPx(perpdexindex);
        sendToHyperCore(AmountToSell); // should be able to do this and place a limit at the same time
        console.log(
            "trade size on hyperCore: ",
            AmountToSell / ETH_ORDER_SIZE_DIVISOR
        );
        CoreWriterLib.placeLimitOrder(
            tokenindex,
            false,
            0,
            uint64(AmountToSell / ETH_ORDER_SIZE_DIVISOR), // ETH-specific: 1e8 = 10^(szDecimals + 4)
            false,
            HLConstants.LIMIT_ORDER_TIF_IOC,
            uint128(block.timestamp)
        );
        uint64 balance = PrecompileLib
            .spotBalance(address(this), TokenAddress)
            .total;
        uint64 perpAmountOfUSDC = HLConversions.weiToPerp(balance);
        CoreWriterLib.transferUsdClass(perpAmountOfUSDC, true);
        return perpAmountOfUSDC;
    }

    function decreaseCollateral(uint256 amount) internal returns (uint256) {
        // sell all of the Token on HyperEVM and use all as collateral
        // ETH-specific: 1e7 for converting USDC amounts in decreaseCollateral
        uint64 perpAmountUSDCToRemove = uint64(
            amount / ETH_DECREASE_COLLATERAL_DIVISOR
        );
        CoreWriterLib.transferUsdClass(perpAmountUSDCToRemove, false);
        CoreWriterLib.placeLimitOrder(
            spotdexindex,
            false,
            0,
            perpAmountUSDCToRemove / uint64(HL_USDC_PERP_PRECISION), // Convert perp USDC to spot order size
            false,
            3,
            uint128(block.timestamp) // check this amount
        ); // limit Ask at price of 0 is basically a market sell.
        return perpAmountUSDCToRemove;
    }

    function increaseShortSize(uint256 amount) internal returns (uint64) {
        // ETH-specific: 10 = 10^(szDecimals - 3) for short size scaling
        uint64 sz = uint64(amount) * uint64(ETH_SHORT_SIZE_SCALE);
        CoreWriterLib.placeLimitOrder(
            perpdexindex,
            false,
            0,
            sz,
            false,
            3,
            uint128(block.timestamp) + 1
        );
        return sz;
    }

    function decreaseShortSize(uint256 amount) internal returns (uint64) {
        // ETH-specific: 10 = 10^(szDecimals - 3) for short size scaling
        uint64 sz = uint64(amount / ETH_SHORT_SIZE_SCALE);
        console.log("size of short decrease sent to hyperliquid", sz);
        CoreWriterLib.placeLimitOrder(
            perpdexindex,
            true,
            0,
            sz,
            false,
            3,
            uint128(block.timestamp) + 1
        );
        return sz;
    }

    function amountShortOnHyperCore() public view returns (uint256) {
        PrecompileLib.Position memory pos = PrecompileLib.position(
            address(this),
            uint16(perpdexindex)
        );
        // ETH-specific: 1e3 = 10^(szDecimals - 1) for position to USDC conversion
        uint256 amountshortOnHyperCore = uint256(
            SignedMath.abs(pos.szi * int256(ETH_POSITION_TO_USDC_SCALE))
        );
        return amountshortOnHyperCore;
    }

    function amountLongOnHyperEVM() public view returns (uint256) {
        return
            uint256(
                PrecompileLib.markPx(perpdexindex) *
                    IERC20(TokenAddress).balanceOf(address(this))
            ) / TOKEN_TO_USDC_DIVISOR;
    }

    bool public nextRebalanceisA = true;
    bool public shouldIncreaseCollateral;

    function rebalance(
        uint256 leverageNumerator,
        uint256 leverageDenominator
    ) public onlyOwner returns (uint256, uint256, bool) {
        if (nextRebalanceisA) {
            nextRebalanceisA = false;
            (uint256 a, uint256 b) = rebalanceA(
                leverageNumerator,
                leverageDenominator
            );
            return (a, b, true);
        } else {
            nextRebalanceisA = true;
            (uint256 a, uint256 b) = rebalanceB();
            return (a, b, false);
        }
    }

    function rebalanceA(
        uint256 leverageNumerator,
        uint256 leverageDenominator
    ) internal returns (uint256, uint256) {
        PrecompileLib.Position memory pos = PrecompileLib.position(
            address(this),
            uint16(perpdexindex)
        );
        uint256 shortOnHyperCore = amountShortOnHyperCore();
        uint256 longOnEVM = amountLongOnHyperEVM();
        uint256 USDCOnHyperCore = coreValueUSDC();
        uint256 returnVal = 1; // for debugging purposes
        uint256 returnVal2 = 1; // likewise
        uint256 targetUSDCOnHyperCore = (leverageNumerator *
            (longOnEVM + USDCOnHyperCore)) /
            (leverageDenominator + leverageNumerator);

        // first we deal with collateral;
        if (
            SignedMath.abs(
                int256(targetUSDCOnHyperCore) - int256(USDCOnHyperCore)
            ) > totalUSDCValueUnderManagement() / 2e3
        ) {
            // only bother moving collateral if we're more than 0.5% off
            if (targetUSDCOnHyperCore > USDCOnHyperCore) {
                shouldIncreaseCollateral = true; // on the next block we will see the USDC balacne on core, and send it to to be collateral.
                returnVal = increaseCollateral(
                    targetUSDCOnHyperCore - USDCOnHyperCore
                );
            }

            if (targetUSDCOnHyperCore < USDCOnHyperCore) {
                shouldIncreaseCollateral = false; // next block we will see the Token spot balance on core, and send it back to EVM
                returnVal = decreaseCollateral(
                    USDCOnHyperCore - targetUSDCOnHyperCore
                );
            }
        }

        // next we deal with tweaking the short position;
        // we do this with much lower leeway so as to remain delta neutral.
        uint256 targetShortOnHyperCore = longOnEVM +
            USDCOnHyperCore -
            targetUSDCOnHyperCore;
        if (
            SignedMath.abs(
                int256(targetShortOnHyperCore) - int256(shortOnHyperCore)
            ) > totalUSDCValueUnderManagement() / 2e4
        ) {
            if (targetShortOnHyperCore > shortOnHyperCore) {
                returnVal2 = increaseShortSize(
                    targetShortOnHyperCore - shortOnHyperCore
                );
            }
            if (targetShortOnHyperCore < shortOnHyperCore) {
                returnVal2 = decreaseShortSize(
                    shortOnHyperCore - targetShortOnHyperCore
                );
            }
        }

        return (returnVal, returnVal2);
    }

    function rebalanceB() internal returns (uint64, uint64) {
        if (shouldIncreaseCollateral) {
            uint64 balance = PrecompileLib
                .spotBalance(address(this), TokenAddress)
                .total;
            uint64 perpAmountOfUSDC = HLConversions.weiToPerp(balance);
            CoreWriterLib.transferUsdClass(perpAmountOfUSDC, true);
            return (perpAmountOfUSDC, shouldIncreaseCollateral ? 0 : 1);
        }
        if (!shouldIncreaseCollateral) {
            // ETH-specific: 1e9 for bridge amount scaling (spot balance to bridge amount)
            uint64 balance = PrecompileLib
                .spotBalance(address(this), TokenAddress)
                .total * uint64(ETH_BRIDGE_AMOUNT_SCALE);
            CoreWriterLib.bridgeToEvm(TokenAddress, balance);
            return (balance, shouldIncreaseCollateral ? 0 : 1);
        }
    }
}
