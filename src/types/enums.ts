export enum BotStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
}

export enum StratState {
  active = "active",
  close_only = "close_only",
  forbidden = "forbidden",
}

export enum OrderType {
  market = "market",
  limit = "limit",
  stop = "stop",
}

export enum OrderState {
  active = "active",
  closed_sl = "closed_sl",
  closed_tp = "closed_tp",
  force_closed = "force_closed",
}

export enum SessionName {
  london = "london",
  new_york = "new_york",
  tokyo = "tokyo",
  sydney = "sydney",
}
