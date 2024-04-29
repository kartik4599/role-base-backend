import { Request, Response } from "express";

export const AdminController = (req: Request, res: Response) => {
  res.send("Admin access granted");
};
export const UserController = (req: Request, res: Response) => {
  res.send("User access granted");
};
export const PatientController = (req: Request, res: Response) => {
  res.send("Patient access granted");
};
