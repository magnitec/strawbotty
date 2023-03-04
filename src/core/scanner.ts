import { MidaTimeframe } from "@reiryoku/mida";
import { adapter } from "./py-adapter";
import { poolManager } from "./PoolManager";

interface StratTarget {
  timeframe: MidaTimeframe;
  themes: string[];
}

export const isMatch = (
  strat: StratMeta,
  target: StratTarget,
  usedPool: StratMeta[],
): boolean => {
  const checks = {
    // no open positions for this strat
    notInUse: usedPool.every((s) => s.name !== strat.name),

    // at least 1 timeframe must match
    fitTimeframe: strat.timeframes.includes(target.timeframe),

    // at least 1 theme must match
    fitTheme: target.themes.includes(strat.theme),

    // strategy must allow opening trades
    active: strat.status === "allowed",
  };

  return Object.values(checks).every((result) => result);
};

export const getActiveSignals = async (
  timeframe: MidaTimeframe,
  ohlcStore: OHLCStore,
) => {
  const signallerPath = "./src/core/strategies"; // .env
  const allStrats = poolManager.getAllStrats();
  const usedPool = poolManager.getUsedPool();
  const remainingPoolAmount = poolManager.getFreePoolAmount();

  const allThemes = allStrats
    .map((s) => s.theme)
    .filter((theme, index, arr) => arr.indexOf(theme) === index);
  const usedThemes = usedPool.map((item) => item.theme);
  const targetThemes = allThemes.filter((theme) => !usedThemes.includes(theme));

  const target: StratTarget = {
    timeframe,
    themes: targetThemes,
  };

  const candidates: ActiveSignalResult[] = []; // all active signals + their ranking + names
  const targetStrats = allStrats.filter((s) => isMatch(s, target, usedPool));
  const allStratNames = targetStrats.map((s) => s.name);

  const signalResults = await adapter(allStratNames, ohlcStore, signallerPath);

  signalResults.forEach((result) => {
    if (result.signal.active) {
      candidates.push({
        signal: result.signal,
        meta: result.meta,
      });
    }
  });

  // signalResults.forEach(({ signal, meta }) => {
  //   if (signal.active) {
  //     candidates.push({
  //       signal: signal,
  //       strat: meta.name,
  //       theme: meta.theme,
  //       rank: meta.rank,
  //     });
  //   }
  // });

  // return (
  //   candidates
  //     // .sort((a, b) => b.rank - a.rank)
  //     .slice(0, remainingPoolAmount)
  // );

  return candidates.slice(0, remainingPoolAmount);
};
