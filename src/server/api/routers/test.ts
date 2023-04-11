import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn } from "child_process";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const pythonRouter = createTRPCRouter({
  test: protectedProcedure.query(async () => {
    return await trycatch({
      fn: () => {
        const python: ChildProcessWithoutNullStreams = spawn("python3", [
          "src/server/api/python/testing.py",
        ]);
        return new Promise<string>((resolve, reject) => {
          let output = "";

          python.stdout.on("data", (data: Buffer) => {
            output += data.toString();
          });

          python.stderr.on("data", (data: Buffer) => {
            reject(data.toString());
          });

          python.on("close", (code) => {
            if (code && code !== 0) {
              reject(`Process exited with code ${code}`);
            } else {
              resolve(output);
            }
          });
        });

        // return new Promise((resolve) => {
        //   python.stdout.on("data", (data: string) => {
        //     console.log(`stdout: ${data}`);
        //     resolve(data);
        //   });

        //   python.stderr.on("data", (data: string) => {
        //     console.error(`stderr: ${data}`);
        //   });

        //   python.on("close", (code: string) => {
        //     console.log(`child process exited with code ${code}`);
        //     resolve(code);
        //   });
        // });
      },
      errorMessages: ["Failed to run python code"],
    })();
  }),
});
