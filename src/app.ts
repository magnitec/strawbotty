import express, { Router } from "express";
import logger from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import { MidaTradingAccount } from "@reiryoku/mida";
import { AccountManager } from "./core/AccountManager";
import { createAllRoutes } from "./routes";
import { env } from "./utils/env-check";
import { poolManager } from "./core/PoolManager";

export const createApp = (
  account: MidaTradingAccount,
  accountManager: AccountManager,
) => {
  const router = Router();
  createAllRoutes(router, account);

  const app = express();

  app.set("port", env.PORT);
  app.set("poolManager", poolManager);
  poolManager.initStrats();
  app.use(logger("dev"));
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use("/", router);

  app.use((req, res, next) => {
    res.status(500).json("");
  });

  // Force all requests on production to be served over https
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https" && env.isProduction) {
      const secureUrl = "https://" + req.hostname + req.originalUrl;
      res.redirect(302, secureUrl);
    }
    next();
  });

  return app;
};
