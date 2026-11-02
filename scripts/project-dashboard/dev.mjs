import { execFileSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const root = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(import.meta.url);
const config = JSON.parse(
  readFileSync(new URL("./prototype-config.json", import.meta.url), "utf8"),
);
const args = process.argv.slice(2);
let port = process.env.PORT || "3000";
const nextArgs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "-p" || args[i] === "--port") port = args[++i];
  else if (args[i].startsWith("--port=")) port = args[i].slice(7);
  else nextArgs.push(args[i]);
}
if (!["3000", "3100"].includes(port)) {
  console.error(
    "Use port 3000 or 3100; both are registered for the prototype Cognito login.",
  );
  process.exit(1);
}
const profile = process.env.BOARD_AWS_PROFILE || "calendar-agent-dev";
let credentials;
try {
  const response = execFileSync(
    "aws",
    [
      "sts",
      "assume-role",
      "--role-arn",
      config.WebRole,
      "--role-session-name",
      "BuildlogDevelopment",
      "--duration-seconds",
      "28800",
      "--profile",
      profile,
      "--region",
      "us-east-1",
      "--output",
      "json",
      "--no-cli-pager",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
  );
  credentials = JSON.parse(response).Credentials;
  if (
    !credentials?.AccessKeyId ||
    !credentials.SecretAccessKey ||
    !credentials.SessionToken
  )
    throw new Error("Incomplete session");
} catch {
  console.error(
    `Could not obtain the scoped Buildlog AWS session. Check that AWS CLI is installed and the '${profile}' profile can assume the prototype web role. Set BOARD_AWS_PROFILE to use another authorized profile.`,
  );
  process.exit(1);
}
const env = {
  ...process.env,
  BOARD_AWS_ACCESS_KEY_ID: credentials.AccessKeyId,
  BOARD_AWS_SECRET_ACCESS_KEY: credentials.SecretAccessKey,
  BOARD_AWS_SESSION_TOKEN: credentials.SessionToken,
  BOARD_AWS_REGION: "us-east-1",
  BOARD_TABLE: config.BoardTable,
  SESSION_TABLE: config.SessionTable,
  COGNITO_POOL_ID: config.PoolId,
  COGNITO_CLIENT_ID: config.ClientId,
  COGNITO_DOMAIN: config.Domain,
  BOARD_API: config.ApiUrl,
  APP_ORIGIN: `http://localhost:${port}`,
  SESSION_SECRET: randomBytes(32).toString("base64url"),
};
console.log(
  `Buildlog configured at ${env.APP_ORIGIN}/board. Restart this server after the eight-hour AWS session expires.`,
);
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", "--port", port, ...nextArgs],
  { cwd: root, env, stdio: "inherit", windowsHide: true },
);
child.on("error", () => {
  console.error("Unable to start the Next.js development server.");
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
