import { db } from "@/lib/db";
import { colors, stores } from "@/lib/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { colorId: string } },
) {
  try {
    if (!params.colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const color = await db.query.colors.findFirst({
      where: eq(colors.id, params.colorId),
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { colorId: string; storeId: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }
    if (!params.colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const [color] = await db
      .delete(colors)
      .where(eq(colors.id, params.colorId))
      .returning();

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { colorId: string; storeId: string } },
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }
    if (!params.colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const [color] = await db
      .update(colors)
      .set({ name, value, updatedAt: new Date() })
      .where(eq(colors.id, params.colorId))
      .returning();

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
