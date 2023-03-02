import { Router } from "express";
import { MidaTradingAccount } from "@reiryoku/mida";
import * as BotController from "../controllers/BotController";

const botRoutes = Router();

const createBotRoutes = (account: MidaTradingAccount) => {
  botRoutes.put("/status", (req, res) =>
    BotController.status(req, res, account),
  );
  botRoutes.put("/start", BotController.start);
  botRoutes.put("/pause", BotController.pause);

  return botRoutes;
};

export { createBotRoutes };
