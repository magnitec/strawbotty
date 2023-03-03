import mongoose from "mongoose";
import { MidaOrderDirection } from "@reiryoku/mida";
import { OrderType } from "../types/enums";
import { env } from "../utils/env-check";

// TP & SL functions

const tradeSchema = new mongoose.Schema({
  cTraderId: {
    type: "number",
    required: true,
  },
  status: {
    type: "string",
    required: true,
    default: () => "active",
  },
  symbol: {
    type: "string",
    required: true,
  },
  amountDeposited: {
    type: "number",
    required: true,
    min: env.MIN_LOT_SIZE,
    max: env.MAX_LOT_SIZE,
  },
  amountPending: {
    type: "number",
    required: false,
  },
  amountClosed: {
    type: "number",
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: () => Date.now(),
    immutable: true,
  },
  closedAt: {
    type: Date,
    required: false,
    immutable: true,
  },
  direction: {
    type: "string",
    enum: [MidaOrderDirection.BUY, MidaOrderDirection.SELL],
    required: true,
    immutable: true,
  },
  orderType: {
    type: "string",
    enum: [OrderType.market, OrderType.limit, OrderType.stop],
    required: true,
    immutable: true,
  },
  strat: {
    type: "string",
    required: true,
  },
  tp: {
    type: "number",
    required: false,
    min: 3, // cTrader's minimum allowed value is 3
  },
  sl: {
    type: "number",
    required: false,
    min: 3, // cTrader's minimum allowed value is 3
  },
});

tradeSchema.post("save", function () {
  // proper logger
  console.log(`Saving trade ${this.cTraderId}`);
});

export const Trade = mongoose.model("Trade", tradeSchema);
