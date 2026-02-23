import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./shared/schema.ts", 
  dialect: "sqlite",
  dbCredentials: {
    url: "sqlite.db", // This points to the file in your root folder
  },
});
/*
The Config File: Since drizzle.config.ts is in the root, it will look for sqlite.db exactly where it currently sits.*/