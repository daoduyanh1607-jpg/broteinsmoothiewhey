import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Register new customer
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        biologicalSex: "male",
        age: 30,
        heightCentimeters: 175,
        weightKilograms: 75,
        activityLevel: "moderately_active",
        trainingDaysPerWeek: 4,
        goal: "fat_loss_muscle_gain",
      },
    });

    const token = jwt.sign(
      { customerId: customer.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRY || "7d" }
    );

    res.status(201).json({
      customer: { id: customer.id, name: customer.name, email: customer.email },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login customer
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, customer.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { customerId: customer.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: process.env.JWT_EXPIRY || "7d" }
    );

    res.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        onboardingCompleted: customer.onboardingCompleted,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get customer profile
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customerId },
      include: {
        preferences: true,
        bodyCompositions: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Update customer profile (onboarding)
router.put("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      biologicalSex,
      age,
      heightCentimeters,
      weightKilograms,
      bodyFatPercentage,
      muscleMassKilograms,
      activityLevel,
      trainingDaysPerWeek,
      goal,
    } = req.body;

    const customer = await prisma.customer.update({
      where: { id: req.customerId },
      data: {
        biologicalSex,
        age,
        heightCentimeters,
        weightKilograms,
        bodyFatPercentage,
        muscleMassKilograms,
        activityLevel,
        trainingDaysPerWeek,
        goal,
      },
    });

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Complete onboarding
router.post(
  "/complete-onboarding",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const customer = await prisma.customer.update({
        where: { id: req.customerId },
        data: { onboardingCompleted: true },
      });

      res.json({ message: "Onboarding completed", customer });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  }
);

export default router;
