"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default_markdown_panel_content_buf = exports.default_calc_table_content_sha256 = exports.default_calc_table_content_buf = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const crypto_1 = __importDefault(require("crypto"));
let default_calc_table_content = "";
exports.default_calc_table_content_sha256 = "";
try {
    default_calc_table_content = fs_1.default.readFileSync(path_1.default.resolve("./assets/default_calc_table_content.txt"), "utf8");
    exports.default_calc_table_content_sha256 = crypto_1.default
        .createHash("sha256")
        .update(default_calc_table_content, "utf8")
        .digest("hex");
    const inputBuffer = Buffer.from(default_calc_table_content);
    exports.default_calc_table_content_buf = zlib_1.default.deflateSync(inputBuffer);
}
catch (err) {
    console.error("FAILED TO LOAD DCTC ", err);
}
let default_markdown_panel_content = "";
try {
    default_markdown_panel_content = fs_1.default.readFileSync(path_1.default.resolve("./assets/default_markdown_panel_content.txt"), "utf8");
    exports.default_markdown_panel_content_buf = zlib_1.default.deflateSync(Buffer.from(default_markdown_panel_content));
}
catch (err) {
    console.error("FAILED TO LOAD DMPC ", err);
}
