import express from "express";
import { isAuth } from "../common/isAuth";
import { execute_query_with_values } from "../models/psql";
import zlib from "zlib";
import { PSQL_DEFAULT_SCHEMA } from "../common/constant";

const markdownPanelsControllers = {
  async load(req: any, res: express.Response) {
    try {
      const { userId } = req;
      // convert_from(column_name, 'UTF8')
      const query_result: any[] = await execute_query_with_values(
        `SELECT ${PSQL_DEFAULT_SCHEMA}.markdown_panels.id AS markdown_panels_id, ${PSQL_DEFAULT_SCHEMA}.markdown_sheets.id AS markdown_sheets_id, ${PSQL_DEFAULT_SCHEMA}.markdown_panels.compressed_content AS compressed_content
            FROM ${PSQL_DEFAULT_SCHEMA}.markdown_panels, ${PSQL_DEFAULT_SCHEMA}.markdown_sheets, ${PSQL_DEFAULT_SCHEMA}.accounts
            WHERE ${PSQL_DEFAULT_SCHEMA}.accounts.id = $1
            AND ${PSQL_DEFAULT_SCHEMA}.accounts.id = markdown_sheets.account_id
            AND ${PSQL_DEFAULT_SCHEMA}.markdown_sheets.id = markdown_panels.markdown_sheet_id
            ORDER BY ${PSQL_DEFAULT_SCHEMA}.markdown_panels.id ASC;`,
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
      // debugger;
      const deflated_panels: any[] = req.body.panels.map((panel: any) => {
        const { id, compressed_content } = panel;
        return {
          cells: zlib.deflateSync(Buffer.from(compressed_content)),
          id,
        };
      });

      const passed_all: boolean | unknown[] = await Promise.all([
        ...deflated_panels.map(
          (tab) =>
            new Promise((res, rej) => {
              execute_query_with_values(
                `UPDATE ${PSQL_DEFAULT_SCHEMA}.markdown_panels SET compressed_content = decode($1,'hex') WHERE id = $2`,
                [tab.cells.toString("hex"), tab.id]
              )
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
          message: "failed to save panels",
        });
      res.status(200).json({
        success: true,
        message: "loaded markdownSheet successfully",
      });
    } catch (err: any) {
      res.status(500).send({
        success: false,
        message: `error while loading markdownSheet ${err.message}`,
      });
    }
    return;
  },
};

export default markdownPanelsControllers;
