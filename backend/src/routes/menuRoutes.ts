import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all menu items
router.get("/items", async (req: Request, res: Response) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: { category: "asc" },
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Get all smoothies
router.get("/smoothies", async (req: Request, res: Response) => {
  try {
    const smoothies = await prisma.smoothie.findMany({
      where: { available: true },
    });

    res.json(smoothies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch smoothies" });
  }
});

// Get all whey products
router.get("/whey", async (req: Request, res: Response) => {
  try {
    const whey = await prisma.wheyProduct.findMany();
    res.json(whey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch whey products" });
  }
});

export default router;
