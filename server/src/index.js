import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { attachUser } from "./auth.js";
import { authRouter } from "./routes/auth.js";
import { metaRouter } from "./routes/meta.js";
import { opportunitiesRouter } from "./routes/opportunities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Render (and most hosts) sit in front of the app behind a reverse proxy;
// without this, req.ip and req.secure are wrong, which breaks rate-limiting
// by IP and the "secure" cookie flag.
app.set("trust proxy", 1);

// CSP is off for now: the frontend is a single file full of inline <script>
// and <style> tags with no nonce/hash setup, which helmet's default CSP
// would block outright. Everything else helmet sets (X-Content-Type-Options,
// X-Frame-Options, HSTS, etc.) stays on.
app.use(helmet({ contentSecurityPolicy: false }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.use("/api/auth", authRouter);
app.use("/api", metaRouter);
app.use("/api/opportunities", opportunitiesRouter);

app.use(express.static(path.join(__dirname, "../../prototype")));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Voya server listening on http://localhost:${port}`));
