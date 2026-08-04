import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";

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

//better-auth routes for authentication
app.all("/api/auth/{*any}", toNodeHandler(auth));

//body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//morgan for logging
app.use(morgan("dev"));

//sample route
app.get("/", (req, res) => res.send("<h2>App is up</h2>"));

//Routes
registerRoutes(app);

//global error handler
app.use(errorHandler);

// connect DB

app.listen(Number(PORT), "0.0.0.0", (error) => {
  return !error
    ? console.log(`server is running at http://localhost:${PORT}`)
    : console.log(error);
});
