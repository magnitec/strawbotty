import {
  decimal,
  MidaDecimal,
  MidaOrderDirection,
  MidaOrderRejection,
  MidaPosition,
  MidaTradingAccount,
} from "@reiryoku/mida";
import { Trade } from "../models/Trade";
import { OrderType } from "../types/enums";
import { env } from "../utils/env-check";

export interface OrderRequest {
  symbol: string;
  direction: MidaOrderDirection;
  lots: number;
  orderType: OrderType;
  strat: string;
  tp?: number;
  sl?: number;
  tpFn?: () => any;
  slFn?: () => any;
}

class OrderRejectionError extends Error {
  strat: string;
  rejection: MidaOrderRejection | undefined;

  constructor(strat: string, rejection: MidaOrderRejection | undefined) {
    super();
    this.strat = strat;
    this.rejection = rejection;
  }
}

export const create = async (
  account: MidaTradingAccount,
  orderRequest: OrderRequest,
) => {
  const order = await account.placeOrder({
    symbol: orderRequest.symbol,
    direction: orderRequest.direction,
    volume: decimal(orderRequest.lots),
    protection: {
      takeProfit: orderRequest.tp,
      stopLoss: orderRequest.sl,
    },
  });

  if (order.isRejected) {
    throw new OrderRejectionError(orderRequest.strat, order.rejection);
  }

  const trade = new Trade({
    cTraderId: order.positionId,
    amountDeposited: Number(order.executedVolume),
    symbol: order.symbol,
    direction: order.direction,
    orderType: orderRequest.orderType,
    strat: orderRequest.strat,
  });

  return await trade.save();
};

export const createTrades = async (
  account: MidaTradingAccount,
  signalResults: ActiveSignalResult[],
) => {
  const balance = await account.getBalance();

  signalResults.forEach(({ signal, meta }) => {
    const lots = calcPositionSize(balance, signal);

    const orderRequest: OrderRequest = {
      symbol: env.PRIMARY_PAIR,
      direction: signal.direction,
      lots,
      orderType: OrderType.market,
      // strat: meta.strat,
      strat: "temp",
      tp: signal.tp,
      sl: signal.sl,
    };

    create(account, orderRequest);
  });
};

export const calcPositionSize = (
  balance: MidaDecimal,
  signal: SignalActive,
) => {
  const riskPercentage = env.RISK;
  const risk = decimal(balance).multiply(riskPercentage);
  const pipsRisked = signal.tp - signal.sl;
  const miniLots = decimal(risk).divide(pipsRisked);

  const positionSize = decimal(miniLots).divide(10).toNumber();

  // const valuePerPip = risk / pipsRisked;
  // const valueRatio = 0.1 * 1; // 10k units of EURUSD * $1 per pip
  // const positionSize = valuePerPip * valueRatio;

  return positionSize;
};

export const close = async (position: MidaPosition, force?: boolean) => {
  const midaOrder = await position.close(); // ok

  let dbOrder = await Trade.findOne({ cTraderId: midaOrder.positionId });

  if (!dbOrder) {
    dbOrder = new Trade({
      id: midaOrder.id,
      amountDeposited: Number(midaOrder.executedVolume),
      symbol: midaOrder.symbol,
      direction: midaOrder.direction,
      orderType: "unknown",
      strat: "unknown",
    });
  }

  if (force) {
    dbOrder.status = "force_closed";
  }
  dbOrder.closedAt = new Date();
  await dbOrder.save();

  return dbOrder;
};
