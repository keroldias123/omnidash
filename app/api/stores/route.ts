import { db } from "@/lib/db";
import { stores } from "@/lib/schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [store] = await db
      .insert(stores)
      .values({ name, userId })
      .returning();

    return NextResponse.json(store);
  } catch (error) {
    console.log(`[STORES_POST] ${error}`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
