import { cleanEnv, str, port, num } from "envalid";
import dotenv from "dotenv";
dotenv.config();

export const env = cleanEnv(process.env, {
  // cTrader credentials
  CT_CLIENT_ID: str(),
  CT_CLIENT_SECRET: str(),
  CT_BROKER_ACCOUNT_ID: str(),
  CT_ACCESS_TOKEN: str(),
  CT_REFRESH_TOKEN: str(),

  // server
  CONNECTION_STRING: str(),
  NODE_ENV: str({ choices: ["development", "test", "production", "staging"] }),
  PORT: port({ default: 3000 }),
  LOG_PATH: str({ default: "logs" }),

  // application
  PRIMARY_PAIR: str(),
  MAX_GLOBAL_POOL: num({ default: 4 }),
  MIN_LOT_SIZE: num(),
  MAX_LOT_SIZE: num(),
  RISK: num(),
  TRADING_HOUR_START: num({ default: 6 }),
  TRADING_HOUR_END: num({ default: 21 }),
});

// # todo: env, connection_string, host to have devDefaults
