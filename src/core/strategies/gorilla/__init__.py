import pandas_ta as ta
import pandas as pd
import numpy as np
from sys import path
path.append('../')
from dict import MidaOrderDirection, Signal
from helpers import pivot_points, is_ema_rebounce
#%%
def signal_long(h1: pd.DataFrame, d1: pd.DataFrame):
    # 1. Today's pivot (PP) is bigger than yesterday's Pivot.
    pivot_today = pivot_points(d1.iloc[-1])
    PP_today = pivot_today["PP"].iloc[-1]
    pivot_yesterday = pivot_points(d1.iloc[-2])
    PP_yesterday = pivot_yesterday["PP"].iloc[-1]

    if (PP_today < PP_yesterday):
        return False

    # 2. All EMA 30,15,4 positions are above today's Pivot.
    ema_30 = ta.ema(h1["close"], length=4).iloc[-1] # length=30
    ema_15 = ta.ema(h1["close"], length=4).iloc[-1] # length=15
    ema_4 = ta.ema(h1["close"], length=4).iloc[-1]

    if (PP_today < ema_30 or PP_today < ema_15 or PP_today < ema_4):
        return False

    # # 3. Entry buy if the price returns to EMA 30. = low < EMA_30 < high for the past 3 candles
    if (~is_ema_rebounce(h1.iloc[-1], ema_30)):
        return False

    return True

#%%
def signal_short(h1: pd.DataFrame, d1: pd.DataFrame):
    # 1. Today's pivot (PP) is smaller than yesterday's Pivot.
    pivot_today = pivot_points(d1.iloc[-1])
    PP_today = pivot_today["PP"].iloc[-1]
    pivot_yesterday = pivot_points(d1.iloc[-2])
    PP_yesterday = pivot_yesterday["PP"].iloc[-1]

    if (PP_today > PP_yesterday):
        return False

    # 2. All EMA 30,15,4 positions are below today's Pivot.
    ema_30 = ta.ema(h1["close"], length=4).iloc[-1] # length=30
    ema_15 = ta.ema(h1["close"], length=4).iloc[-1] # length=15
    ema_4 = ta.ema(h1["close"], length=4).iloc[-1]

    if (PP_today > ema_30 or PP_today > ema_15 or PP_today > ema_4):
        return False

    # # 3. Entry buy if the price returns to EMA 30. = low < EMA_30 < high for the past 3 candles
    if (~is_ema_rebounce(h1.iloc[-1], ema_30)):
        return False

    return True


# todo: abstract
def signal(candles_store: dict[str, pd.DataFrame]) -> Signal:
    if signal_long(candles_store["h1"], candles_store["d1"]):
        return {
            "active": True,
            "direction": MidaOrderDirection.BUY,
            "sl": 10,
            "tp": 20,
        }
    elif signal_short(candles_store["h1"], candles_store["d1"]):
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