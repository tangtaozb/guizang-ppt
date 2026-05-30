const op = require("officeparser");
const { readFileSync, appendFileSync } = require("fs");
const { tmpdir } = require("os");

const LOG = "/tmp/parse-result.txt";
require("fs").writeFileSync(LOG, "START\n");
function log(m) { appendFileSync(LOG, m + "\n"); }

process.on("uncaughtException", (e) => log("UNCAUGHT: " + (e && e.stack ? e.stack.split("\n").slice(0,4).join(" | ") : e)));
process.on("unhandledRejection", (e) => log("UNHANDLED: " + (e && e.message ? e.message : e)));

(async () => {
  const buf = readFileSync("/tmp/test.docx");
  log("docx buffer read: " + buf.length + "B");
  try {
    log("calling parseOfficeAsync...");
    const text = await op.parseOfficeAsync(buf, { tempFilesLocation: tmpdir() });
    log("DOCX OK len=" + text.length + " :: " + JSON.stringify(text.slice(0, 100)));
  } catch (e) {
    log("DOCX FAIL :: " + (e && e.message ? e.message : String(e)));
  }
  log("DONE");
})().catch((e) => log("OUTER: " + e));
