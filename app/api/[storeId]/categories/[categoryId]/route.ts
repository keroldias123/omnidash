import { db } from "@/lib/db";
import { categories, stores } from "@/lib/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } },
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, params.categoryId),
      with: {
        billboard: true,
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string; storeId: string } },
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // First, set children's parentId to null
    await db
      .update(categories)
      .set({ parentId: null, updatedAt: new Date() })
      .where(eq(categories.parentId, params.categoryId));

    const [category] = await db
      .delete(categories)
      .where(eq(categories.id, params.categoryId))
      .returning();

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string; storeId: string } },
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

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Prevent self-referencing
    if (parentId === params.categoryId) {
      return new NextResponse("Category cannot be its own parent", {
        status: 400,
      });
    }

    const [category] = await db
      .update(categories)
      .set({
        name,
        billboardId: billboardId || null,
        parentId: parentId || null,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, params.categoryId))
      .returning();

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
