import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import {
  registerSchema,
  loginSchema,
} from "../../validators/auth/auth.validator";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid registration details.",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const { username, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "This username is already registered. Please choose another username.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "CONTRIBUTOR",
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Your account has been created successfully. You can now log in.",
      data: user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message:
        "We couldn't create your account due to a server error. Please try again later.",
    });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid username and password.",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password. Please check your credentials and try again.",
      });
    }

    const token = jwt.sign({ role: user.role }, getJwtSecret(), {
      subject: user.id,
      expiresIn: "2h",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful. Welcome back!",
      token,
      expiresIn: "2h",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message:
        "We couldn't log you in due to a server error. Please try again later.",
    });
  }
}
