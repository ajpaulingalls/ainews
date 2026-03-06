import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export async function GET() {
  const categories = db.select().from(schema.categories).all();
  return NextResponse.json(categories);
}
