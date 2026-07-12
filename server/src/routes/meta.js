import { Router } from "express";
import { pool } from "../db.js";

export const metaRouter = Router();

metaRouter.get("/countries", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT code, name, region, is_non_conventional_dest AS non_conventional, is_gulf, latitude, longitude FROM countries ORDER BY name"
  );
  res.json({ countries: rows });
});

metaRouter.get("/currencies", async (_req, res) => {
  const { rows } = await pool.query("SELECT code, name FROM currencies ORDER BY code");
  res.json({ currencies: rows });
});
