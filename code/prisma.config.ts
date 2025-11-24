import { defineConfig, env } from "@prisma/config";
import path from "node:path";

export default defineConfig({
  // Use the directory instead of a single file
  schema: path.join("prisma", "schema"),
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
