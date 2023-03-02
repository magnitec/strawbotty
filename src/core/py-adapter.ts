import { PythonShell } from "python-shell";

export const adapter = (args: string[], path: string) =>
  new Promise((resolve, reject) => {
    const options = {
      args,
      scriptPath: path,
    };

    PythonShell.run("signaller.py", options, (err, result) => {
      const processed = result ? JSON.parse(result[0]) : null;

      if (err) {
        reject(err);
      }

      resolve(processed);
    });
  });
