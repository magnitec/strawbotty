import {
  MidaTradingSystem,
  MidaTradingSystemParameters,
  MidaTick,
  MidaTimeframe,
  MidaPeriod,
} from "@reiryoku/mida";
import { env } from "../utils/env-check";
import * as TradeService from "../services/TradeService";
import { getAllSignals } from "./scanner";
import { checkAvailability } from "../utils/availability";

export class AccountManager extends MidaTradingSystem {
  timeframes: Timeframe[];

  constructor({ tradingAccount }: MidaTradingSystemParameters) {
    super({ tradingAccount });
    this.timeframes = [
      MidaTimeframe.M1,
      MidaTimeframe.M5,
      MidaTimeframe.M15,
      MidaTimeframe.H1,
      MidaTimeframe.H4,
    ];
  }

  watched() {
    return {
      EURUSD: {
        watchPeriods: true,
        watchTicks: true,
        timeframes: [
          MidaTimeframe.M1,
          MidaTimeframe.M5,
          MidaTimeframe.M15,
          MidaTimeframe.H1,
          MidaTimeframe.H4,
        ],
      },
    };
  }

  // async configure() {
  //   // Called once per trading system instance
  // }

  async onStart() {
    console.log("AccountManager: start");
  }

  async onTick(tick: MidaTick) {
    // BotService.synchronize(this.tradingAccount);
  }

  async getHistoricalPeriods(): Promise<OHLCStore> {
    // # todo: performance

    const periods: OHLCStore = {
      [MidaTimeframe.M1]: [],
      [MidaTimeframe.M5]: [],
      [MidaTimeframe.M15]: [],
      [MidaTimeframe.H1]: [],
      [MidaTimeframe.H4]: [],
    };

    await Promise.all(
      this.timeframes.map(async (timeframe) => {
        const midaPeriod = await this.tradingAccount.getSymbolPeriods(
          env.PRIMARY_PAIR,
          timeframe,
        );

        const ohlc: MidaOHLC[] = midaPeriod.slice(-60).map((p) => {
          return {
            timestamp: p.endDate.timestamp,
            open: p.open.toNumber(),
            high: p.high.toNumber(),
            low: p.low.toNumber(),
            close: p.close.toNumber(),
          };
        });

        periods[timeframe] = ohlc;
      }),
    );

    return periods;
  }

  async onPeriodClose(period: MidaPeriod) {
    // # todo: min margin must be met
    const openPositions = await this.tradingAccount.getOpenPositions();

    const isTradingAllowed = checkAvailability(
      new Date(),
      openPositions.length,
    );
    if (!isTradingAllowed) {
      return;
    }

    const periods = await this.getHistoricalPeriods();
    const signals = await getAllSignals(period.timeframe, periods);
    TradeService.createTrades(this.tradingAccount, signals);
  }

  async onStop() {
    console.log("AccountManager: stop");
  }
}
