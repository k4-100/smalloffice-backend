import fs from "fs";
import path from "path";
import zlib from "zlib";
import crypto from "crypto";

let default_calc_table_content: string = "";
export let default_calc_table_content_buf: Buffer;
export let default_calc_table_content_sha256: string = "";

try {
  default_calc_table_content = fs.readFileSync(
    path.resolve("./assets/default_calc_table_content.txt"),
    "utf8"
  );

  default_calc_table_content_sha256 = crypto
    .createHash("sha256")
    .update(default_calc_table_content, "utf8")
    .digest("hex");

  const inputBuffer = Buffer.from(default_calc_table_content);
  default_calc_table_content_buf = zlib.deflateSync(inputBuffer);
} catch (err) {
  console.error("FAILED TO LOAD DCTC ", err);
}

let default_markdown_panel_content: string = "";
export let default_markdown_panel_content_buf: Buffer;

try {
  default_markdown_panel_content = fs.readFileSync(
    path.resolve("./assets/default_markdown_panel_content.txt"),
    "utf8"
  );
  default_calc_table_content_buf = zlib.deflateSync(
    Buffer.from(default_markdown_panel_content)
  );
} catch (err) {
  console.error("FAILED TO LOAD DMPC ", err);
}
