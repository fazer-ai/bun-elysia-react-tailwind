import Elysia from "elysia";
import { authController } from "@/api/features/auth/auth.controller";
import { healthController } from "@/api/features/health/health.controller";

const api = new Elysia().use(authController).use(healthController);

export default api;
