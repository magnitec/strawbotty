import { createApp } from "./app";
import { AccountManager, accountManager } from "./core/AccountManager";
import mongoose from "mongoose";
import { env } from "./utils/env-check";
import { BotState } from "./models/BotState";
import { BotStatus } from "./types/enums";
import { TradingSystem } from "./core/TradingSystem";

const run = async () => {
  mongoose.set("strictQuery", true);

  console.log("Connecting to db...");
  await mongoose.connect(env.CONNECTION_STRING);
  console.log("Connection successful.");

  const botState = await BotState.findOne();
  if (!botState) {
    await BotState.create({
      status: BotStatus.ACTIVE,
      usedPool: [],
    });
  }

  console.log("Initializing the application...");
  await accountManager.login();
  const account = accountManager.getAccount();
  const tradingSystem = new TradingSystem({ tradingAccount: account });
  await tradingSystem.start();

  const app = createApp(account, tradingSystem);

  app.listen(env.PORT, () => console.log("Application started."));

  process.on("SIGINT", () => {
    tradingSystem.stop();
    mongoose.connection.close();
  });
};

run();
