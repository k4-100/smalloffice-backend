import express from "express";
import { isAuth } from "../common/isAuth";
import { execute_query_with_values } from "../models/psql";
import zlib from "zlib";

const markdownPanelsControllers = {
  async load(req: any, res: express.Response) {
    try {
      const { userId } = req;
      // convert_from(column_name, 'UTF8')
      const query_result: any[] = await execute_query_with_values(
        `SELECT markdown_panels.id AS markdown_panels_id, markdown_sheets.id AS markdown_sheets_id, markdown_panels.compressed_content AS compressed_content
            FROM markdown_panels, markdown_sheets, accounts
            WHERE accounts.id = $1
            AND accounts.id = markdown_sheets.account_id
            AND markdown_sheets.id = markdown_panels.markdown_sheet_id;`,
        [userId]
      );
      if (!query_result)
        res.status(500).json({
          success: false,
          message: "query is null",
          userId,
        });

      const data = query_result.map((panel) => {
        // debugger;
        const compressed_content_buffer = Buffer.from(panel.compressed_content);
        const inflated = zlib.inflateSync(compressed_content_buffer);
        const newObj = {
          ...panel,
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

  async save(req: any, res: express.Response) {
    try {
      const { userId } = req;
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
                `UPDATE markdown_panels SET compressed_content = decode($1,'hex') WHERE id = $2`,
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
};

export default markdownPanelsControllers;
