import { Mida, MidaTradingAccount } from "@reiryoku/mida";
import { CTraderPlugin } from "@reiryoku/mida-ctrader";
import { env } from "../utils/env-check";

Mida.use(new CTraderPlugin());

export class AccountManager {
  account: MidaTradingAccount | null = null;

  public getAccount(): MidaTradingAccount {
    if (!this.account) {
      throw new Error("Account isn't initialized.");
    }

    return this.account;
  }

  async login() {
    try {
      this.account = await Mida.login("cTrader", {
        clientId: env.CT_CLIENT_ID,
        clientSecret: env.CT_CLIENT_SECRET,
        accessToken: env.CT_ACCESS_TOKEN,
        cTraderBrokerAccountId: env.CT_BROKER_ACCOUNT_ID,
        demoProxy: "demo-eu-1.ctraderapi.com",
        liveProxy: "live-eu-1.ctraderapi.com",
      });
    } catch (e) {
      // Wrapper for Mida's broken error parser.
      console.error("Error while logging into Mida.", e);
      throw e;
    }
  }
}

export const accountManager = new AccountManager();
