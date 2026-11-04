import { container } from "tsyringe";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { prisma } from "./client.js";

container.registerInstance<PrismaClient>("PrismaClient", prisma);