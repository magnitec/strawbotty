import { createApp } from "./app";
import { init } from "./core/init";
import mongoose from "mongoose";
import { env } from "./utils/env-check";
import { BotState } from "./models/BotState";
import { BotStatus } from "./types/enums";

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
  const { account, accountManager } = await init();
  const app = createApp(account, accountManager);

  app.listen(env.PORT, () => console.log("Application started."));

  process.on("SIGINT", () => {
    accountManager.stop();
    mongoose.connection.close();
  });
};

run();
