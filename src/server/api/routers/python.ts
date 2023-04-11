import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn } from "child_process";
import path from "path";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const pythonRouter = createTRPCRouter({
  test: protectedProcedure.query(async () => {
    return await trycatch({
      fn: () => {
        console.log(
          path.join(process.cwd(), "/src/server/api/python/testing.py")
        );
        const python: ChildProcessWithoutNullStreams = spawn("python3", [
          path.join(process.cwd(), "/src/server/api/python/testing.py"),
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
      },
      errorMessages: ["Failed to run python code"],
    })();
  }),
});
