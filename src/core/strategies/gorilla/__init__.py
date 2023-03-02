import pandas_ta as ta
import pandas as pd
import numpy as np
from sys import path
path.append('../')
from dict import MidaOrderDirection, Signal
from helpers import pivot_points, is_ema_rebounce

# usdjpy, though maybe also eurusd
# h1; d1
# not trading on Monday


# Buy
# 1. Today's pivot (PP) is bigger than yesterday's Pivot.
# 2. All EMA 30,15,4 positions are above today's Pivot.
# 3. Entry buy if the price returns to EMA 30. = low < EMA_30 < high for the past 3 candles

# 4. The target is R3 but this position can be closed if the last 4 candles cannot penetrate upwards while the New York market is immediately closed.
# 5. Stop loss is 30 pips and you can Exit if EMA 4 crosses Ema 15 down.

# Sell
# Today's pivot must be lower than yesterday's Pivot.
# 2. EMA 4 <15 <30
# 3. Enter immediately when the price turns around EMA30
# 4. Keep watching the action from EMA4 after the last candle is closed.
# 5. If EMA4 comes to cut EMA15 then immediately exit when the candle is closed.
# 6. If all is smooth then all EMAs will occupy their respective positions.
# 7. If the price has reached S2 and there are some candles that are not able to penetrate the lower limit, then that means Support in that area is very strong. My advice is that you should immediately exit.
# 8. The target is S3. No need to take risks to get bigger profits because in S3 usually a lot of traders will take profits (meaning the price will correct upwards and
# your profits will decrease). 

# TP:
# varies from 30 to a maximum of 80 pips (or R3 / S3 has been reached) 
# SL:
# 30 pips

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