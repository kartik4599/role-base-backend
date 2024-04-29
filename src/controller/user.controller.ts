import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import * as argon from "argon2";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client/edge";

const prisma = new PrismaClient();

export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body as {
      email: string;
      password: string;
      role: "Admin" | "User" | "Patient";
    };

    if (!["Admin", "User", "Patient"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
        isError: true,
      });
    }
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
        isError: true,
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return res.status(400).json({
        message: "User already exists with this email",
        isError: true,
      });
    }

    const passwordHash = await argon.hash(password);

    const { passwordHash: _, ...newUser } = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      isError: false,
      data: newUser,
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong",
      isError: true,
      error: e,
    });
  }
};

export const signinController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
        isError: true,
      });
    }

    const isPasswordValid = await argon.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
        isError: true,
      });
    }

    let token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      message: "User logged in successfully",
      isError: false,
      token,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      message: "Something went wrong",
      isError: true,
      error: e,
    });
  }
};

const checkRole = async (req: Request, res: Response, role: Role) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      message: "Unauthorized",
      isError: true,
    });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
      isError: true,
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as
    | {
        id: number;
        role: Role;
      }
    | undefined;

  if (!decoded) {
    return res.status(401).json({
      message: "Unauthorized",
      isError: true,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
      role,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
      isError: true,
    });
  }

  return user;
};

export const RoleMiddleware = (role: Role) => {
  return async (req: Request | any, res: Response, next: NextFunction) => {
    const user = await checkRole(req, res, role);
    if (user) {
      req.user = user;
      next();
    }
  };
};
