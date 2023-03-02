import pandas as pd
import numpy as np
from scipy.stats import linregress
from sys import path
path.append('../')
from dict import MidaOrderDirection


def get_swing_high(df: pd.DataFrame) -> pd.DataFrame:
    df["high_diff"] = df["high"].diff()
    df["high_diff"].iloc[0] = 0
    df["swing_high"] = (df["high_diff"] > 0).astype(int).cumsum()
    df["group"] = df.groupby("swing_high")["high"].transform("idxmax")

    return df.set_index("group")["high"].max()


def is_pullback(df: pd.DataFrame, direction: MidaOrderDirection) -> bool:
    # Bullish: an oversold level is typically below 30.
    # RSI surpasses the 30 level after being below it and then retraces back close to it.
    # Bearish: an overbought level is typically above 70.
    # RSI breaks the 70 level after being above it and then retraces back close to it.

    rsi = df.ta.rsi()
    
    if direction == MidaOrderDirection.BUY:
        oversold_level = 30
        return (rsi[rsi >= oversold_level].index[0] < rsi[rsi < oversold_level].index[-1]) & (rsi.iloc[-1] > oversold_level)
    elif direction == MidaOrderDirection.SELL:
        overbought_level = 70
        return (rsi[rsi <= overbought_level].index[0] < rsi[rsi > overbought_level].index[-1]) & (rsi.iloc[-1] < overbought_level)


def calculate_trendlines(df: pd.DataFrame) -> pd.Series:
    dft = df.copy()

    dft['idx'] = np.arange(len(dft)) + 1

    # higher points are returned
    df_high = dft[['idx', 'open', 'high', 'low', 'close']]
    while len(df_high) > 2:
        slope, intercept, r_value, p_value, std_err = linregress(x=df_high['idx'], y=df_high['high'])
        df_high = df_high.loc[df_high['high'] > slope * df_high['idx'] + intercept]

    if len(df_high) < 2:
        return np.nan

    # lower points are returned
    df_low = dft[['idx', 'open', 'high', 'low', 'close']]
    while len(df_low) > 2:
        slope, intercept, r_value, p_value, std_err = linregress(x=df_low['idx'], y=df_low['low'])
        df_low = df_low.loc[df_low['low'] < slope * df_low['idx'] + intercept]

    if len(df_low) < 2:
        return np.nan
    
    # Calculate uptrend line
    slope, intercept, r_value, p_value, std_err = linregress(x=df_high['idx'], y=df_high['close'])
    dft['uptrend'] = slope * dft['idx'] + intercept

    # # Calculate downtrend line
    slope, intercept, r_value, p_value, std_err = linregress(x=df_low['idx'], y=df_low['close'])
    dft['downtrend'] = slope * dft['idx'] + intercept
    
    return dft


def pivot_points(data: pd.Series) -> pd.DataFrame:
    high, low, close = data["high"], data["low"], data["close"]

    PP = (high + low + close) / 3
    S1 = (2 * PP) - high
    S2 = PP - (high - low)
    R1 = (2 * PP) - low
    R2 = PP + (high - low)

    return pd.DataFrame({
        'PP': [PP],
        'S1': [S1],
        'S2': [S2],
        'R1': [R1],
        'R2': [R2]
    }, index=[data.name])


def is_ema_rebounce(candle: pd.DataFrame, ema: float) -> bool:
    return candle["low"] < ema < candle["high"]