from typing import TypedDict
from enum import Enum
from typing import Any, Callable, Optional, Union


class OHLC(TypedDict):
    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: Optional[float]


class MidaOrderDirection(str, Enum):
    BUY = "buy"
    SELL = "sell"


class SignalActive:
    active = True
    direction: MidaOrderDirection
    tp: Optional[float] = float
    sl: Optional[float] = float
    tpFn: Optional[Callable[[Any], bool]] = bool
    slFn: Optional[Callable[[Any], bool]] = bool


class SignalInactive:
    active = False


Signal = Union[SignalActive, SignalInactive]
