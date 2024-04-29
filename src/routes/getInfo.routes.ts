import { Router } from "express";
import {
  AdminController,
  PatientController,
  UserController,
} from "../controller/info.controller";
import { RoleMiddleware } from "../controller/user.controller";

const InfoRouter = Router();

InfoRouter.get("/admin", RoleMiddleware("Admin"), AdminController);

InfoRouter.get("/patient", RoleMiddleware("Patient"), PatientController);

InfoRouter.get("/user", RoleMiddleware("User"), UserController);

export default InfoRouter;
