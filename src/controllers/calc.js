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
const zlib_1 = __importDefault(require("zlib"));
// import { isAuth } from "../common/isAuth";
const psql_1 = require("../models/psql");
const constant_1 = require("../common/constant");
const calcControllers = {
    load(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req;
                // convert_from(column_name, 'UTF8')
                const query_result = yield (0, psql_1.execute_query_with_values)(`SELECT  ${constant_1.PSQL_DEFAULT_SCHEMA}.calc_tables.id AS calc_tables_id,  ${constant_1.PSQL_DEFAULT_SCHEMA}.calc_sheets.id AS calc_sheets_id,  ${constant_1.PSQL_DEFAULT_SCHEMA}.calc_tables.uncompressed_content_checksum,${constant_1.PSQL_DEFAULT_SCHEMA}.calc_tables.compressed_content AS compressed_content
            FROM ${constant_1.PSQL_DEFAULT_SCHEMA}.calc_tables, ${constant_1.PSQL_DEFAULT_SCHEMA}.calc_sheets, ${constant_1.PSQL_DEFAULT_SCHEMA}.accounts 
            WHERE ${constant_1.PSQL_DEFAULT_SCHEMA}.accounts.id = $1
            AND ${constant_1.PSQL_DEFAULT_SCHEMA}.accounts.id = calc_sheets.account_id
            AND ${constant_1.PSQL_DEFAULT_SCHEMA}.calc_sheets.id = calc_tables.calc_sheet_id`, [userId]);
                if (!query_result)
                    res.status(500).json({
                        success: false,
                        message: "query is null",
                        userId,
                    });
                const data = query_result.map((table) => {
                    // debugger;
                    const compressed_content_buffer = Buffer.from(table.compressed_content);
                    const inflated = zlib_1.default.inflateSync(compressed_content_buffer);
                    const newObj = Object.assign(Object.assign({}, table), { compressed_content: inflated.toString("utf8") });
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
            // {
            //   id: 29,
            //   tables: [
            //     { cells: [Array], id: 16 },
            //     { cells: [Array], id: 17 },
            //     { cells: [Array], id: 18 }
            //   ],
            //   mainTabID: 16
            // }
            try {
                const { userId } = req;
                console.log("userID in save: ", userId);
                // debugger;
                const deflated_tables = req.body.sheet.tables.map((tab) => {
                    const { id } = tab;
                    const tab_no_id = tab;
                    delete tab_no_id.id;
                    return {
                        cells: zlib_1.default.deflateSync(Buffer.from(JSON.stringify(tab_no_id))),
                        id,
                    };
                });
                const passed_all = yield Promise.all([
                    ...deflated_tables.map((tab) => new Promise((res, rej) => {
                        (0, psql_1.execute_query_with_values)(`UPDATE ${constant_1.PSQL_DEFAULT_SCHEMA}.calc_tables SET compressed_content = decode($1,'hex') WHERE id = $2`, [tab.cells.toString("hex"), tab.id])
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
                        message: "failed to save tables",
                    });
                res.status(200).json({
                    success: true,
                    message: "saved sheet successfully",
                });
            }
            catch (err) {
                res.status(500).send({
                    success: false,
                    message: `error while loading sheet ${err.message}`,
                });
            }
            return;
        });
    },
};
exports.default = calcControllers;
