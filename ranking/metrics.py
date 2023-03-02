# input: a list of Trades PER Strat (per Strat is managed elsewhere)

# (later) avg time
# (later) sortino / sharpe


import string
from typing import List


class Trade:
    direction: string
    open: float
    close: float

    def __init__(self, direction, open, close):
        self.direction = direction
        self.open = open
        self.close = close


class StratMetrics:
    trades: List[Trade]

    def __init__(self, trades):
        self.trades = trades

    def _calculate_sum(self, win_or_lose):
        sum = 0
        for trade in self.trades:
            is_win = (trade.direction == "long" and trade.close > trade.open) or (
                trade.direction == "short" and trade.close < trade.open)
            is_lose = (trade.direction == "long" and trade.close < trade.open) or (
                trade.direction == "short" and trade.close > trade.open)

            if win_or_lose == "win" and is_win:
                sum += abs(trade.close - trade.open)
            elif win_or_lose == "lose" and is_lose:
                sum += abs(trade.close - trade.open)

        return sum

    def _calculate_num(self, win_or_lose):
        num = 0
        for trade in self.trades:
            is_win = (trade.direction == "long" and trade.close > trade.open) or (
                trade.direction == "short" and trade.close < trade.open)
            if (win_or_lose == "win" and is_win) or (win_or_lose == "lose" and not is_win):
                num += 1
        return num

    def _calculate_percentage(self, win_or_lose):
        total_num = len(self.trades)
        if total_num == 0:
            return 0
        if (win_or_lose == "win"):
            return (self.num_win() / total_num) * 100
        elif win_or_lose == "lose":
            return (self.num_lose() / total_num) * 100

    def num_win(self):
        return self._calculate_num("win")

    def num_lose(self):
        return self._calculate_num("lose")

    def sum_win(self):
        return self._calculate_sum("win")

    def sum_lose(self):
        return self._calculate_sum("lose")

    def avg_winner(self):
        if (self.num_win() == 0):
            return 0
        return self.sum_win() / self.num_win()

    def avg_loser(self):
        if (self.num_lose() == 0):
            return 0
        return self.sum_lose() / self.num_lose()

    def percentage_win(self):
        return self._calculate_percentage("win")

    def percentage_lose(self):
        return self._calculate_percentage("lose")

    def expected_value(self):
        if (self.percentage_win() is None or self.percentage_lose() is None):
            return None
        return (self.avg_winner() * self.percentage_win()) - (self.avg_loser() * self.percentage_lose())

    def expectation(self):
        if (self.expected_value() is None):
            return None
        return self.expected_value() / self.avg_loser() / 100