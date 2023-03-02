import { MidaTimeframe } from "@reiryoku/mida";
import { MidaOrderDirection } from "@reiryoku/mida";

export {};

declare global {
  type Timeframe =
    | MidaTimeframe.M1
    | MidaTimeframe.M5
    | MidaTimeframe.M15
    | MidaTimeframe.H1
    | MidaTimeframe.H4;
  interface OHLC {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }

  interface MidaOHLC {
    timestamp: number;
    open: MidaDecimal;
    high: MidaDecimal;
    low: MidaDecimal;
    close: MidaDecimal;
    volume?: number;
  }

  // interface OHLCStore {
  //   m1?: OHLC[];
  //   m5?: OHLC[];
  //   m15?: OHLC[];
  //   h1?: OHLC[];
  //   h4?: OHLC[];
  // }

  // type OHLCStore2 = Partial<Record<Timeframe, MidaPeriod[]>>;

  // type OHLCStore3 = Partial<Record<Timeframe, OHLC[]>>;

  type OHLCStore = Partial<Record<Timeframe, OHLC[]>>;

  // deprecated
  interface Bask {
    bid: OHLC & { volume?: number }?;
    ask: OHLC & { volume?: number }?;
    timestamp: number;
  }

  interface SignalActive {
    active: true;
    direction: MidaOrderDirection;
    tp: number;
    sl: number;
    tpFn?: (...args: unknown) => boolean;
    slFn?: (...args: unknown) => boolean;
  }

  interface SignalInactive {
    active: false;
  }

  type Signal = SignalActive | SignalInactive;

  interface SignalResult {
    signal: Signal;
    // meta: StratMeta;
    meta: {
      name: string;
    };
  }

  interface ActiveSignalResult {
    signal: SignalActive;
    // meta: StratMeta;
    meta: {
      name: string;
    };
  }

  // ==

  interface StratMeta {
    name: string;
    theme: string;
    timeframes: MidaTimeframe[];
    status: string;
    sessions?: SessionName[];
    rank: number;
  }

  // // interface StratMetaTarget extends Partial<StratMeta> {}
  // interface StratMetaTarget {
  //   kinds?: string[];
  //   timeframes?: string[];
  //   sessions?: SessionName[];
  // }
  // interface Strategy {
  //   meta: StratMeta;
  //   entry: (bids: OHLC[], asks: OHLC[]) => Entry;
  // }
}
