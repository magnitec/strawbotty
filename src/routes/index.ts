import { Router } from "express";
import { createBotRoutes } from "./botRoutes";
import { MidaTradingAccount } from "@reiryoku/mida";

export const createAllRoutes = (
  router: Router,
  account: MidaTradingAccount,
) => {
  router.use("/bot", createBotRoutes(account));
};
