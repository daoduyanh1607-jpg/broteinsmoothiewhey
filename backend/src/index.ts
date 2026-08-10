import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/customers", require("./routes/customerRoutes").default);
app.use("/api/nutrition", require("./routes/nutritionRoutes").default);
app.use("/api/menu", require("./routes/menuRoutes").default);
app.use("/api/orders", require("./routes/orderRoutes").default);

// Error handling middleware
app.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  }
);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📊 API Health: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n📛 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
