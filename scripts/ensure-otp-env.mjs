import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const envPath = ".env";
let env = readFileSync(envPath, "utf8");
if (!env.endsWith("\n")) env += "\n";

function valueOf(key) {
  const m = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}

function upsert(key, value) {
  const line = `${key}=${value}`;
  if (new RegExp(`^${key}=`, "m").test(env)) {
    env = env.replace(new RegExp(`^${key}=.*$`, "m"), line);
  } else {
    env += `${line}\n`;
  }
}

const before = {
  resend: Boolean(valueOf("RESEND_API_KEY")),
  from: Boolean(valueOf("RESEND_FROM_EMAIL")),
  secret: Boolean(valueOf("STUDENT_SESSION_SECRET")),
};

if (!before.secret) {
  upsert("STUDENT_SESSION_SECRET", randomBytes(32).toString("hex"));
}
if (!valueOf("RESEND_FROM_EMAIL")) {
  upsert("RESEND_FROM_EMAIL", "Envision <onboarding@resend.dev>");
}
if (valueOf("RESEND_API_KEY") === null) {
  upsert("RESEND_API_KEY", "");
}

writeFileSync(envPath, env, "utf8");

console.log(
  JSON.stringify({
    before,
    after: {
      resend: Boolean(valueOf("RESEND_API_KEY")),
      from: Boolean(valueOf("RESEND_FROM_EMAIL")),
      secret: Boolean(valueOf("STUDENT_SESSION_SECRET")),
    },
  }),
);
