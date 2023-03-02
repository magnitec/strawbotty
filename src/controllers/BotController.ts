import { Request, Response } from "express";
import { MidaTradingAccount } from "@reiryoku/mida";
import * as BotService from "../services/BotService";

export const status = async (
  req: Request,
  res: Response,
  account: MidaTradingAccount,
) => {
  BotService.status(account)
    .then((result) => res.status(200).json(result))
    .catch((e) => res.status(500).json(e)); // # todo: next it to an error handler
};

export const start = async (req: Request, res: Response) => {
  BotService.start()
    .then((result) => res.status(200).json(result))
    .catch((e) => res.status(500).json(e)); // # todo: next it to an error handler
};

export const pause = (req: Request, res: Response) => {
  BotService.pause()
    .then((result) => res.status(200).json(result))
    .catch((e) => res.status(500).json(e)); // # todo: next it to an error handler
};
