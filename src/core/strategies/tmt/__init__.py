import pandas_ta as ta
import pandas as pd
import numpy as np
from sys import path
path.append('../')
from dict import MidaOrderDirection, Signal
from helpers import is_pullback, calculate_trendlines

# Buy Rules
# 1. Daily candle is Green
# 2. RSI is above 50
# 3. MFI is above 50
# 4. Uptrend (7 EMA is above 20 EMA)
# 5. Price pullback inside 7 and 20 EMA
# 6. Draw TrendLine from highest swing
# 7. Price to break above trendline
# 8. SL/TP: 10/20


def signal_long(m15: pd.DataFrame, d1: pd.DataFrame) -> bool:
    close = m15["close"].iloc[-1]
    ema7 = ta.ema(m15["close"], length=7).iloc[-1]
    ema20 = ta.ema(m15["close"], length=20).iloc[-1]
    trendlines = calculate_trendlines(m15)

    rules = [
        # 1. Daily candle is Green
        d1.iloc[-1]["close"] > d1.iloc[-1]["open"],

        # 2. RSI is above 50
        m15.ta.rsi().iloc[-1] > 50,

        # 3. MFI is above 50
        m15.ta.mfi().iloc[-1] > 50,

        # 4. Uptrend (7 EMA is above 20 EMA)
        ema7 > ema20,

        # 5. Price pullback inside 7 and 20 EMA
        is_pullback(m15, MidaOrderDirection.BUY) & (ema20 < close < ema7),

        # 6. get the highest swing and pass as the start of the trendline

        # 7. price to break above trendline
        close > trendlines.iloc[-1].uptrend if ~np.isnan(trendlines) else False
    ]

    return all(rules)

# Sell Rules
# 1. Daily candle is Red
# 2. RSI is below 50
# 3. MFI is below 50
# 4. Downtrend (7 EMA is below 20 EMA)
# 5. Price pullback inside 7 and 20 EMA
# 6. Draw TrendLine from lowest swing
# 7. Price to break below trendline and bar is closed
# 8. SL/TP: 10/20

def signal_short(m15: pd.DataFrame, d1: pd.DataFrame) -> bool:
    # performance todo:
    # return false when any of the rules not met

    close = m15["close"].iloc[-1]
    ema7 = ta.ema(m15["close"], length=7).iloc[-1]
    ema20 = ta.ema(m15["close"], length=20).iloc[-1]
    trendlines = calculate_trendlines(m15)

    rules = [
        # 1. Daily candle is Red
        d1.iloc[-1]["close"] < d1.iloc[-1]["open"],

        # 2. RSI is below 50
        m15.ta.rsi().iloc[-1] < 50,

        # 3. MFI is below 50
        m15.ta.mfi().iloc[-1] < 50,

        # 4. Downtrend (7 EMA is below 20 EMA)
        ema7 < ema20,

        # 5. Price pullback inside 7 and 20 EMA
        is_pullback(m15, MidaOrderDirection.SELL) & (ema7 < close < ema20),

        # 6. get the lowest swing and pass as the start of the trendline

        # 7. price to break below trendline
        close < trendlines.iloc[-1].uptrend if ~np.isnan(trendlines) else False
    ]

    return all(rules)


# todo: abstract
def signal(candles_store: dict[str, pd.DataFrame]) -> Signal:
    if signal_long(candles_store["m15"], candles_store["d1"]):
        return {
            "active": True,
            "direction": MidaOrderDirection.BUY,
            "sl": 10,
            "tp": 20,
        }
    elif signal_short(candles_store["m15"], candles_store["d1"]):
        return {
            "active": True,
            "direction": MidaOrderDirection.SELL,
            "sl": 10,
            "tp": 20,
        }
    else:
        return {
            "active": False,
        }