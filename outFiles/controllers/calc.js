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
const isAuth_1 = require("../common/isAuth");
const psql_1 = require("../models/psql");
const calcControllers = {
    load(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = (0, isAuth_1.isAuth)(req);
                if (userId == null) {
                    res.status(500).json({
                        success: false,
                        message: "userID == null",
                    });
                }
                const query_result = yield (0, psql_1.execute_query)(`SELECT calc_tables.id AS calc_tables_id, calc_sheets.id AS calc_sheets_id, calc_tables.uncompressed_content_checksum, calc_tables.compressed_content AS compressed_content
            FROM calc_tables, calc_sheets, accounts 
            WHERE accounts.id = ${userId}
            AND accounts.id = calc_sheets.account_id
            AND calc_sheets.id = calc_tables.calc_sheet_id`);
                if (!query_result)
                    res.status(500).json({
                        success: false,
                        message: "query is null",
                        userId,
                    });
                res.status(200).json({
                    success: true,
                    message: "loaded sheet successfully",
                    data: query_result.map((table) => (Object.assign(Object.assign({}, table), { compressed_content: zlib_1.default
                            .inflateSync(zlib_1.default.deflateSync(table.compressed_content))
                            .toString("utf8") }))),
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
            // console.log(req.body);
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
                const userId = (0, isAuth_1.isAuth)(req);
                if (userId == null) {
                    res.status(500).json({
                        success: false,
                        message: "userID == null",
                    });
                }
                const deflated_tables = req.body.sheet.tables.map((tab) => ({
                    cells: zlib_1.default.deflateSync(JSON.stringify(tab.cells)),
                    id: tab.id,
                }));
                // console.log(deflated_tables);
                const passed_all = deflated_tables.every((tab) => __awaiter(this, void 0, void 0, function* () {
                    const query_result = yield (0, psql_1.execute_query)(`INSERT INTO calc_tables(compressed_content, uncompressed_content_checksum) VALUES( E'\\${tab.cells}', '1')
              WHERE calc_sheets.id = calc_tables.calc_sheet_id`);
                    // debugger;
                    return query_result == true;
                }));
                if (!passed_all)
                    return res.status(500).json({
                        success: true,
                        message: "failed to load all tables successfully",
                    });
                res.status(200).json({
                    success: true,
                    message: "loaded sheet successfully",
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
    // app.get("/api/v1", (req, res) => {
    //   res.status(200).json({
    //     success: true,
    //     message: "api root",
    //   });
    // });
    // app.post("/protected", async (req, res) => {
    //   try {
    //     const userId = isAuth(req);
    //     if (userId !== null) {
    //       res.status(200).json({
    //         success: true,
    //         message: "This is protected data.",
    //       });
    //     }
    //   } catch (err: any) {
    //     res.send({
    //       success: false,
    //       error: `${err.message}`,
    //     });
    //   }
    // });
};
exports.default = calcControllers;
//# sourceMappingURL=calc.js.map