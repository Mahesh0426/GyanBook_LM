import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();
const PORT = process.env.PORT || 8001;

//middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (req, res) => res.send("<h2>App is up</h2>"));

//Routerss

// connect DB

app.listen(Number(PORT), "0.0.0.0", (error) => {
  return !error
    ? console.log(`server is running at http://localhost:${PORT}`)
    : console.log(error);
});
