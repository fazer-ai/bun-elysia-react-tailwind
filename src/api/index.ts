import Elysia from "elysia";
import { authController } from "@/api/auth/auth.controller";
import { healthController } from "@/api/health/health.controller";

const api = new Elysia().use(authController).use(healthController);

export default api;
