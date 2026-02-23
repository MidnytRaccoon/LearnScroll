import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import path from "path";

// Using path.resolve helps avoid issues with relative paths on Windows
const sqlite = new Database(path.resolve(process.cwd(), "sqlite.db")); 

export const db = drizzle(sqlite, { schema });