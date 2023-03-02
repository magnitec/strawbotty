import fs from "fs/promises";
import { BotState } from "../models/BotState";
import { env } from "../utils/env-check";
import { getDirNames } from "../utils/helpers";

class PoolManager {
  static instance: PoolManager;
  private maxPoolSize: number;
  private strats: StratMeta[];
  private usedPool: StratMeta[];

  private constructor(maxPoolSize: number) {
    this.strats = [];
    this.usedPool = [];
    this.maxPoolSize = maxPoolSize;
  }

  public static getInstance(): PoolManager {
    if (!PoolManager.instance) {
      PoolManager.instance = new PoolManager(env.MAX_GLOBAL_POOL);
    }

    return PoolManager.instance;
  }

  async initStrats() {
    const stratPath = "./src/core/strategies";
    const loaded = await getDirNames(stratPath);
    const metas = [];

    for (const strat of loaded) {
      const config = await fs.readFile(`${stratPath}/${strat}/config.json`);
      const meta: StratMeta = JSON.parse(config.toString());
      metas.push(meta);
    }

    this.strats = metas;
  }

  getAllStrats() {
    return this.strats;
  }

  useStrat(strat: StratMeta) {
    if (this.isMaxPoolReached()) {
      console.warn(
        "PoolManager: cannot link a strat. Pool size reached maximum.",
      );
      return;
    }

    this.usedPool.push(strat);
    this.updateBotState(this.usedPool);
  }

  freeStrat(stratName: string) {
    if (this.usedPool.length === 0) {
      console.error("PoolManager: cannot unlink from an empty pool.");
      return;
    }

    this.usedPool.forEach((strat, index) => {
      if (strat.name === stratName) {
        this.usedPool.splice(index, 1);
      }
    });

    this.updateBotState(this.usedPool);
  }

  private updateBotState(newPool: StratMeta[]) {
    BotState.findOneAndUpdate(
      {},
      { usedPool: newPool },
      { new: true, runValidators: true, setDefaultsOnInsert: true },
      (err, doc) => {
        if (err) {
          console.error("updateBotState", err);
        } else {
          console.log("updateBotState", doc);
        }
      },
    );
  }

  getUsedPool() {
    return this.usedPool;
  }

  getFreePoolAmount() {
    return this.maxPoolSize - this.usedPool.length;
  }

  isMaxPoolReached() {
    return this.usedPool.length === this.maxPoolSize;
  }
}

export const poolManager = PoolManager.getInstance();
