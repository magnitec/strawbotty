import string
from typing import List
from metrics import Metrics


class Trade:
    direction: string
    open: float
    close: float

    def __init__(self, direction, open, close):
        self.direction = direction
        self.open = open
        self.close = close


class StrategyHistory:
    name: string
    trades: List[Trade]

    def __init__(self, name, trades):
        self.name = name
        self.trades = trades


class Ranker:
    strategyHistory: List[StrategyHistory]

    def __init__(self, strategyHistory):
        self.history = strategyHistory

    def rank(self):
        ranked = []

        for strategy in self.history:
            rankResult = Metrics(strategy.trades).expectation()
            ranked.append({
                "name": strategy.name,
                "rank": rankResult,
            })

        return ranked
