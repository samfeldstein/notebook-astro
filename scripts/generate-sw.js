import fs from "node:fs";

const template = fs.readFileSync(
  "scripts/sw-template.js",
  "utf8"
);

const version = Date.now();

const output = template.replace(
  "__VERSION__",
  version
);

fs.writeFileSync(
  "public/sw.js",
  output
);