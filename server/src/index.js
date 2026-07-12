import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { attachUser } from "./auth.js";
import { authRouter } from "./routes/auth.js";
import { metaRouter } from "./routes/meta.js";
import { opportunitiesRouter } from "./routes/opportunities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.use("/api/auth", authRouter);
app.use("/api", metaRouter);
app.use("/api/opportunities", opportunitiesRouter);

app.use(express.static(path.join(__dirname, "../../prototype")));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Wayfarer server listening on http://localhost:${port}`));
