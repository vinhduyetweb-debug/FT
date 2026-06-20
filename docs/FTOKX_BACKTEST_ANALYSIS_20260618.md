# FTOKX Backtest Analysis — 2026-06-18

## Verdict

Current FTOKX config: **FAIL for real-money use**.

Recommended next config: **FTOKX Safe Optimized Config V1.2.3 candidate**.

This analysis is based on the uploaded export `ftokx-backtest-20260618-223852.zip`.

## Current Config

| Metric | Value |
|---|---:|
| Trade days | 62 |
| Net PnL | -6.35 USDT |
| Max drawdown | -20.75 USDT |
| Profit factor | 0.922 |
| Win rate | 40.32% |
| Win/Loss days | 25 / 37 |
| Max consecutive losses | 6 |
| LONG PnL | -2.8 USDT |
| SHORT PnL | -3.55 USDT |
| Safety score | -27.7294 |

## Recommended Config

```js
SIGNAL_CONFIG = {
  minTradeScore: 7,
  minScoreGap: 2,
  btcCoreMinPass: 5,
  atrPctMin: 0.01,
  atrPctMax: 0.02,
  minDistanceFromEma20: 0.004,
  extremeRangeMultiplier: 1.6,
  lossCooldownMinScore: 8
}
```

## Recommended Config Backtest

| Metric | Value |
|---|---:|
| Trade days | 33 |
| Net PnL | 16.6 USDT |
| Max drawdown | -12.45 USDT |
| Profit factor | 1.4723 |
| Win rate | 42.42% |
| Win/Loss days | 14 / 19 |
| Max consecutive losses | 5 |
| LONG PnL | 6.0 USDT |
| SHORT PnL | 10.6 USDT |
| Safety score | 3.4709 |

## Main changes versus current config

| Parameter | Current | Recommended |
|---|---:|---:|
| minTradeScore | 6 | 7 |
| minScoreGap | 2 | 2 |
| btcCoreMinPass | 4 | 5 |
| atrPctMin | 0.00755 | 0.01 |
| atrPctMax | 0.03 | 0.02 |
| minDistanceFromEma20 | 0.0025 | 0.004 |
| extremeRangeMultiplier | 1.8 | 1.6 |
| lossCooldownMinScore | 7 | 8 |

## Key observations

1. Current config trades too often and loses money over the tested window.
2. Raising `minTradeScore` to 7 materially improves safety and expected result.
3. Tightening ATR to 1%–2% helps filter bad volatility regimes.
4. A stricter BTC core gate of 5/5 fits risk-first usage.
5. OKB is the biggest drag in the current config: current ticket PnL by symbol is BTC +10.95, ETH -2.35, OKB -14.95.
6. The best result still has a max drawdown of -12.45 USDT and 5 consecutive losses, so this is not ready for aggressive real-money usage.

## Next recommendation

Use this only as **paper trading / micro mode** for 14–30 more days.

Do not increase position size.

Next backtest version should add variants:
- BTC+ETH only
- BTC only
- LONG only
- SHORT only
- remove OKB ticket
- compare current 3-ticket model versus 1-ticket and 2-ticket models

## Final position

Recommended app update name:

**FTOKX SIMPLE PWA V1.2.3 — Safe Optimized Signal Config**

