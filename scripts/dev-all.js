// Runs the API and the website together: `npm run dev:all`.
// Output from each is prefixed with its name. Ctrl+C stops both,
// and if either one exits, the other is stopped too.
import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const tasks = [
  { name: "api", script: "dev:api", color: "\x1b[35m" },
  { name: "web", script: "dev", color: "\x1b[36m" },
];

const children = [];
let stopping = false;

function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
  process.exitCode = code;
}

function prefixLines(stream, label, target) {
  let buffered = "";
  stream.on("data", (chunk) => {
    buffered += chunk;
    const lines = buffered.split("\n");
    buffered = lines.pop();
    for (const line of lines) target.write(`${label} ${line}\n`);
  });
  stream.on("end", () => buffered && target.write(`${label} ${buffered}\n`));
}

for (const { name, script, color } of tasks) {
  const label = `${color}[${name}]\x1b[0m`;
  const child = spawn(npm, ["run", script], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  prefixLines(child.stdout, label, process.stdout);
  prefixLines(child.stderr, label, process.stderr);
  child.on("exit", (code) => {
    if (!stopping) {
      console.log(
        `${label} stopped (exit code ${code ?? 0}); stopping the others.`,
      );
      stopAll(code ?? 1);
    }
  });
  children.push(child);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
