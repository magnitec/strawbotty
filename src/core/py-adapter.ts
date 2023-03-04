import assert from "assert";
import { PythonShell } from "python-shell";

export const adapter = (
  stratList: string[],
  ohlcStore: OHLCStore,
  signallerPath: string,
) =>
  new Promise<SignalResult[]>((resolve, reject) => {
    const options = {
      args: [JSON.stringify(stratList), JSON.stringify(ohlcStore)],
      scriptPath: signallerPath,
    };

    PythonShell.run("signaller.py", options, (err, result) => {
      const processed = result ? JSON.parse(result[0]) : null;

      assert(
        isSignalResults(processed),
        "The result is not an array of SignalResult objects",
      );

      if (err) {
        reject(err);
      }

      resolve(processed);
    });
  });

const isSignalResults = (value: unknown): value is SignalResult[] => {
  return (
    Array.isArray(value) &&
    value.every((signalResult) => {
      return (
        signalResult !== null &&
        typeof signalResult === "object" &&
        "meta" in signalResult &&
        "active" in signalResult.signal
      );
    })
  );
};
