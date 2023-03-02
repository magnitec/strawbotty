import { MidaTradingAccount } from "@reiryoku/mida";
import { BotStatus } from "../types/enums";
import { BotState } from "../models/BotState";

export const status = async (account: MidaTradingAccount) => {
  const botState = await getBotState();
  const balance = await account.getBalance();
  const equity = await account.getEquity();
  const openPositions = await getOpenPositionsInfo(account);

  return {
    active: botState,
    operativity: account.operativity,
    balance: balance.toNumber(),
    equity: equity.toNumber(),
    openPositions: openPositions.length,
  };
};

export const getBotState = async () => {
  const botState = await BotState.findOne();

  return new Promise<BotStatus>((resolve, reject) => {
    if (!botState) {
      reject();
    } else {
      resolve(botState.status);
    }
  });
};

export const start = () => {
  return new Promise((resolve, reject) => {
    BotState.findOneAndUpdate(
      {},
      { status: BotStatus.ACTIVE },
      { new: true, runValidators: true, setDefaultsOnInsert: true },
      (err, doc) => {
        if (err) {
          reject(err);
        } else {
          if (!doc) {
            reject(new Error("Could not find document."));
          } else {
            resolve(doc.status);
          }
        }
      },
    );
  });
};

export const pause = () => {
  return new Promise((resolve, reject) => {
    BotState.findOneAndUpdate(
      {},
      { status: BotStatus.PAUSED },
      { new: true, runValidators: true, setDefaultsOnInsert: true },
      (err, doc) => {
        if (err) {
          reject(err);
        } else {
          if (!doc) {
            reject(new Error("Could not find document."));
          } else {
            resolve(doc.status);
          }
        }
      },
    );
  });
};

// ----------------------------------------------------------------

export const synchronize = async (account: MidaTradingAccount) => {
  // if a position opened or closed on the broker side, the db should update as well
};

export const getOpenPositionsInfo = async (account: MidaTradingAccount) => {
  const midaPositions = await account.getOpenPositions();

  return midaPositions.map((pos) => {
    return {
      id: pos.id,
      direction: pos.direction,
      volume: pos.volume,
    };
  });
};
