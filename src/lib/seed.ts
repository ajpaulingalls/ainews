import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { hashSync } from "bcryptjs";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "news.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'author',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    category_id INTEGER REFERENCES categories(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    published_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

const db = drizzle(sqlite, { schema });

// Seed default admin user
const existingAdmin = sqlite
  .prepare("SELECT id FROM users WHERE email = ?")
  .get("admin@ainews.com");

if (!existingAdmin) {
  const passwordHash = hashSync("admin123", 10);
  sqlite
    .prepare(
      "INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .run("admin@ainews.com", "Admin", passwordHash, "admin", Date.now());
  console.log("Created admin user: admin@ainews.com / admin123");
}

// Seed default categories
const defaultCategories = [
  { name: "Technology", slug: "technology", description: "Tech news and trends" },
  { name: "Business", slug: "business", description: "Business and finance" },
  { name: "Science", slug: "science", description: "Scientific discoveries" },
  { name: "Politics", slug: "politics", description: "Political news" },
  { name: "World", slug: "world", description: "International news" },
];

for (const cat of defaultCategories) {
  const existing = sqlite
    .prepare("SELECT id FROM categories WHERE slug = ?")
    .get(cat.slug);
  if (!existing) {
    sqlite
      .prepare(
        "INSERT INTO categories (name, slug, description, created_at) VALUES (?, ?, ?, ?)"
      )
      .run(cat.name, cat.slug, cat.description, Date.now());
  }
}

console.log("Database seeded successfully.");
sqlite.close();
