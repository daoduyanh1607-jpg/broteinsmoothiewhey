import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Create order from meal plan
router.post(
  "/",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { mealPlanId, plannedMealId } = req.body;

      if (!mealPlanId || !plannedMealId) {
        return res
          .status(400)
          .json({ error: "mealPlanId and plannedMealId are required" });
      }

      const order = await prisma.order.create({
        data: {
          customerId: req.customerId!,
          mealPlanId,
          plannedMealId,
          status: "pending",
        },
      });

      res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create order" });
    }
  }
);

// Get customer's orders
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.customerId },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get order status
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
      });

      if (!order || order.customerId !== req.customerId) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  }
);

export default router;
