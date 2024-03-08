"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const psql_1 = require("../models/psql");
const zlib_1 = __importDefault(require("zlib"));
const constant_1 = require("../common/constant");
const markdownPanelsControllers = {
    load(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req;
                // convert_from(column_name, 'UTF8')
                const query_result = yield (0, psql_1.execute_query_with_values)(`SELECT ${constant_1.PSQL_DEFAULT_SCHEMA}.markdown_panels.id AS markdown_panels_id, ${constant_1.PSQL_DEFAULT_SCHEMA}.markdown_sheets.id AS markdown_sheets_id, ${constant_1.PSQL_DEFAULT_SCHEMA}.markdown_panels.compressed_content AS compressed_content
            FROM ${constant_1.PSQL_DEFAULT_SCHEMA}.markdown_panels, ${constant_1.PSQL_DEFAULT_SCHEMA}.markdown_sheets, ${constant_1.PSQL_DEFAULT_SCHEMA}.accounts
            WHERE ${constant_1.PSQL_DEFAULT_SCHEMA}.accounts.id = $1
            AND ${constant_1.PSQL_DEFAULT_SCHEMA}.accounts.id = markdown_sheets.account_id
            AND ${constant_1.PSQL_DEFAULT_SCHEMA}.markdown_sheets.id = markdown_panels.markdown_sheet_id
            ORDER BY ${constant_1.PSQL_DEFAULT_SCHEMA}.markdown_panels.id ASC;`, [userId]);
                if (!query_result)
                    res.status(500).json({
                        success: false,
                        message: "query is null",
                        userId,
                    });
                const data = query_result.map((panel) => {
                    // debugger;
                    const compressed_content_buffer = Buffer.from(panel.compressed_content);
                    const inflated = zlib_1.default.inflateSync(compressed_content_buffer);
                    const newObj = Object.assign(Object.assign({}, panel), { compressed_content: inflated.toString("utf8") });
                    return newObj;
                });
                res.status(200).json({
                    success: true,
                    message: "loaded sheet successfully",
                    data,
                });
            }
            catch (err) {
                res.status(500).send({
                    success: false,
                    message: `error while loading sheet ${err.message}`,
                });
            }
        });
    },
    save(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // debugger;
                const deflated_panels = req.body.panels.map((panel) => {
                    const { id, compressed_content } = panel;
                    return {
                        cells: zlib_1.default.deflateSync(Buffer.from(compressed_content)),
                        id,
                    };
                });
                const passed_all = yield Promise.all([
                    ...deflated_panels.map((tab) => new Promise((res, rej) => {
                        (0, psql_1.execute_query_with_values)(`UPDATE ${constant_1.PSQL_DEFAULT_SCHEMA}.markdown_panels SET compressed_content = decode($1,'hex') WHERE id = $2`, [tab.cells.toString("hex"), tab.id])
                            .then((q_r) => {
                            if (!q_r)
                                rej(false);
                            else {
                                res(true);
                            }
                        })
                            .catch(() => rej(false));
                    })),
                ])
                    .then((rs) => rs)
                    .catch(() => false);
                if (!passed_all)
                    return res.status(500).json({
                        success: true,
                        message: "failed to save panels",
                    });
                res.status(200).json({
                    success: true,
                    message: "loaded markdownSheet successfully",
                });
            }
            catch (err) {
                res.status(500).send({
                    success: false,
                    message: `error while loading markdownSheet ${err.message}`,
                });
            }
            return;
        });
    },
};
exports.default = markdownPanelsControllers;
