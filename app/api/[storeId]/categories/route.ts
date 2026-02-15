import { db } from "@/lib/db";
import { categories, stores } from "@/lib/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, billboardId, parentId } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Validate no circular reference
    if (parentId) {
      const parentCategory = await db.query.categories.findFirst({
        where: eq(categories.id, parentId),
      });
      if (!parentCategory) {
        return new NextResponse("Parent category not found", { status: 400 });
      }
    }

    const [category] = await db
      .insert(categories)
      .values({
        name,
        billboardId: billboardId || null,
        parentId: parentId || null,
        storeId: params.storeId,
      })
      .returning();

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const result = await db.query.categories.findMany({
      where: eq(categories.storeId, params.storeId),
      with: {
        billboard: true,
        parent: true,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
