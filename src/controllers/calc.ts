import express from "express";
import zlib from "zlib";
import { isAuth } from "../common/isAuth";
import { execute_query } from "../models/psql";

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

      const query_result: any[] = await execute_query(
        `SELECT calc_tables.id AS calc_tables_id, calc_sheets.id AS calc_sheets_id, calc_tables.uncompressed_content_checksum, calc_tables.compressed_content AS compressed_content
            FROM calc_tables, calc_sheets, accounts 
            WHERE accounts.id = ${userId}
            AND accounts.id = calc_sheets.account_id
            AND calc_sheets.id = calc_tables.calc_sheet_id`
      );

      if (!query_result)
        res.status(500).json({
          success: false,
          message: "query is null",
          userId,
        });

      res.status(200).json({
        success: true,
        message: "loaded sheet successfully",
        data: query_result.map((table) => ({
          ...table,
          compressed_content: zlib
            .inflateSync(zlib.deflateSync(table.compressed_content))
            .toString("utf8"),
        })),
      });
    } catch (err: any) {
      res.status(500).send({
        success: false,
        message: `error while loading sheet ${err.message}`,
      });
    }
  },

  async save(req: express.Request, res: express.Response) {
    // req.body
    //

    //     data:{
    // calc_tables_id:
    //       calc_sheets_id:
    //       uncompressed_content_checksum:
    //       compressed_content:
    //     }

    try {
      const userId = isAuth(req);
      if (userId == null) {
        res.status(500).json({
          success: false,
          message: "userID == null",
        });
      }
      // for (let i = 0; i < 3; i++) {
      //   // const tableBuffer = Buffer.from(default_calc_table_content);
      //   // deflatedTableBuffer = zlib.deflateSync(inputBuffer);
      //   await execute_query(
      //     `INSERT INTO calc_tables() VALUES(${})
      //       WHERE calc_sheets.id = calc_tables.calc_sheet_id`
      //   );
      // }
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
