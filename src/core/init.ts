import { Mida } from "@reiryoku/mida";
import { CTraderPlugin } from "@reiryoku/mida-ctrader";
import { AccountManager } from "./AccountManager";
import { env } from "../utils/env-check";

Mida.use(new CTraderPlugin());

export const init = async () => {
  try {
    const account = await Mida.login("cTrader", {
      clientId: env.CT_CLIENT_ID,
      clientSecret: env.CT_CLIENT_SECRET,
      accessToken: env.CT_ACCESS_TOKEN,
      cTraderBrokerAccountId: env.CT_BROKER_ACCOUNT_ID,
      demoProxy: "demo-eu-1.ctraderapi.com",
      liveProxy: "live-eu-1.ctraderapi.com",
    });

    const accountManager = new AccountManager({ tradingAccount: account });
    await accountManager.start();

    return {
      account,
      accountManager,
    };
  } catch (e) {
    // Wrapper for Mida's broken error parser.
    console.error("Error while logging into Mida.", e);
    throw e;
  }
};
