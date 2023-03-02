import mongoose from "mongoose";
import { env } from "../utils/env-check";
import { BotStatus } from "../types/enums";

const botStateSchema = new mongoose.Schema({
  status: {
    type: "string",
    required: true,
    enum: [BotStatus.ACTIVE, BotStatus.PAUSED],
    default: () => BotStatus.ACTIVE,
  },
  usedPool: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: () => [],
    validate: {
      validator: function (v: string[]) {
        return v.length <= env.MAX_GLOBAL_POOL;
      },
      message: "{VALUE} exceeds the maximum length of {env.MAX_GLOBAL_POOL}",
    },
  },
});

export const BotState = mongoose.model("BotState", botStateSchema);
