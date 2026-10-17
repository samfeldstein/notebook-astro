import fs from "node:fs";
import crypto from "node:crypto";

const template = fs.readFileSync(
  "scripts/sw-template.js",
  "utf8"
);

// Version from the template's content, so a deploy only clears the
// precache when the service worker itself changes.
const version = crypto
  .createHash("sha256")
  .update(template)
  .digest("hex")
  .slice(0, 12);

const output = template.replace(
  "__VERSION__",
  version
);

fs.writeFileSync(
  "public/sw.js",
  output
);
