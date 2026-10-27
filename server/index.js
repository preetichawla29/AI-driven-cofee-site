import { randomUUID } from "node:crypto";
import express from "express";
import { addBooking, readData } from "./lib/store.js";
import { validateBooking } from "../shared/validateBooking.js";

const PORT = Number(process.env.PORT) || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const MIN_DELAY = 400;
const MAX_DELAY = 800;

const app = express();

// CORS: allow the Vite dev server (or any origin by default) to call the API
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Simulate network latency so loading states can be seen
app.use("/api", (req, res, next) => {
  const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  setTimeout(next, delay);
});

app.use(express.json({ limit: "10kb" }));

const sendData = (name) => async (req, res, next) => {
  try {
    res.json(await readData(name));
  } catch (err) {
    next(err);
  }
};

app.get("/api/menu", sendData("menu"));
app.get("/api/gallery", sendData("gallery"));
app.get("/api/info", sendData("info"));

app.post("/api/bookings", async (req, res, next) => {
  try {
    const info = await readData("info");
    const { errors, booking } = validateBooking(req.body, info);
    if (errors) return res.status(422).json({ errors });

    const saved = await addBooking({
      id: randomUUID(),
      ...booking,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ booking: saved });
  } catch (err) {
    next(err);
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Malformed JSON bodies -> 400; anything else -> 500
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
