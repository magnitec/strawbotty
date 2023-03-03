import pandas_ta as ta
import pandas as pd
import numpy as np
from sys import path
path.append('../')
from dict import MidaOrderDirection, Signal
from helpers import is_pullback, calculate_trendlines

def signal_long(m15: pd.DataFrame, d1: pd.DataFrame) -> bool:
    # 1. Daily candle is Green
    if ~(d1.iloc[-1]["close"] > d1.iloc[-1]["open"]):
        return False
    
    # 2. RSI is above 50
    if ~(m15.ta.rsi().iloc[-1] > 50):
        return False
    
    # 3. MFI is above 50
    if ~(m15.ta.mfi().iloc[-1] > 50):
        return False
    
    # 4. Uptrend (7 EMA is above 20 EMA)
    ema7 = ta.ema(m15["close"], length=7).iloc[-1]
    ema20 = ta.ema(m15["close"], length=20).iloc[-1]
    if ~(ema7 > ema20):
        return False
    
    # 5. Price pullback inside 7 and 20 EMA
    close = m15["close"].iloc[-1]
    if ~(is_pullback(m15, MidaOrderDirection.BUY) & (ema20 < close < ema7)):
        return False
    
    # 6. get the highest swing and pass as the start of the trendline

    # 7. price to break above trendline
    trendlines = calculate_trendlines(m15)
    if ~(close > trendlines.iloc[-1].uptrend if ~np.isnan(trendlines) else True):
        return False

    return True

def signal_short(m15: pd.DataFrame, d1: pd.DataFrame) -> bool:
    # 1. Daily candle is Red
    if ~(d1.iloc[-1]["close"] < d1.iloc[-1]["open"]):
        return False
    
    # 2. RSI is below 50
    if ~(m15.ta.rsi().iloc[-1] < 50):
        return False
    
    # 3. MFI is below 50
    if ~(m15.ta.mfi().iloc[-1] < 50):
        return False
    
    # 4. Downtrend (7 EMA is below 20 EMA)
    ema7 = ta.ema(m15["close"], length=7).iloc[-1]
    ema20 = ta.ema(m15["close"], length=20).iloc[-1]
    if ~(ema7 < ema20):
        return False
    
    # 5. Price pullback inside 7 and 20 EMA
    close = m15["close"].iloc[-1]
    if ~(is_pullback(m15, MidaOrderDirection.SELL) & (ema7 < close < ema20)):
        return False
    
    # 6. get the lowest swing and pass as the start of the trendline

    # 7. price to break below trendline
    trendlines = calculate_trendlines(m15)
    if ~(close < trendlines.iloc[-1].uptrend if ~np.isnan(trendlines) else True):
        return False

    return True


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