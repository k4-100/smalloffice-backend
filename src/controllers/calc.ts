import express from "express";
import zlib from "zlib";
import { isAuth } from "../common/isAuth";
import { execute_query_with_values } from "../models/psql";

const calcControllers = {
  async load(req: express.Request, res: express.Response) {
    try {
      const userId = isAuth(req);
      if (userId == null) {
        res.status(500).json({
          success: false,
          message: "userID == null",
        });
      }

      // convert_from(column_name, 'UTF8')
      const query_result: any[] = await execute_query_with_values(
        `SELECT calc_tables.id AS calc_tables_id, calc_sheets.id AS calc_sheets_id, calc_tables.uncompressed_content_checksum, calc_tables.compressed_content AS compressed_content
            FROM calc_tables, calc_sheets, accounts 
            WHERE accounts.id = $1
            AND accounts.id = calc_sheets.account_id
            AND calc_sheets.id = calc_tables.calc_sheet_id`,
        [userId]
      );

      if (!query_result)
        res.status(500).json({
          success: false,
          message: "query is null",
          userId,
        });

      //   "fsafsa",
      //   zlib
      //     .inflateSync(zlib.deflateSync(query_result[0].compressed_content))
      //     .toString("utf8")
      // );

      const data = query_result.map((table) => {
        // debugger;
        const compressed_content_buffer = Buffer.from(table.compressed_content);
        const inflated = zlib.inflateSync(compressed_content_buffer);
        const newObj = {
          ...table,
          compressed_content: inflated.toString("utf8"),
        };
        return newObj;
      });
      res.status(200).json({
        success: true,
        message: "loaded sheet successfully",
        data,
      });
    } catch (err: any) {
      res.status(500).send({
        success: false,
        message: `error while loading sheet ${err.message}`,
      });
    }
  },

  async save(req: express.Request, res: express.Response) {
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
      const userId = isAuth(req);
      if (userId == null) {
        res.status(500).json({
          success: false,
          message: "userID == null",
        });
      }

      // debugger;
      const deflated_tables: any[] = req.body.sheet.tables.map((tab: any) => {
        const { id } = tab;

        const tab_no_id = tab;
        delete tab_no_id.id;

        return {
          cells: zlib.deflateSync(Buffer.from(JSON.stringify(tab_no_id))),
          id,
        };
      });

      // const passed_all: boolean = deflated_tables.every(async (tab) => {
      //
      // });

      const passed_all: boolean | unknown[] = await Promise.all([
        ...deflated_tables.map(
          (tab) =>
            new Promise((res, rej) => {
              execute_query_with_values(
                `UPDATE calc_tables SET compressed_content = decode($1,'hex') WHERE id = $2`,
                [tab.cells.toString("hex"), tab.id]
              )
                // execute_query(
                //   `UPDATE calc_tables SET compressed_content = E'\\${tab.cells}' WHERE id = ${tab.id}`
                // )
                .then((q_r) => {
                  if (!q_r) rej(false);
                  else {
                    res(true);
                  }
                })
                .catch(() => rej(false));
            })
        ),
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
        message: "loaded sheet successfully",
      });
    } catch (err: any) {
      res.status(500).send({
        success: false,
        message: `error while loading sheet ${err.message}`,
      });
    }
    return;
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

export default calcControllers;
