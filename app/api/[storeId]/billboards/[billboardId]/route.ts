import { db } from "@/lib/db";
import { billboards, stores } from "@/lib/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } },
) {
  try {
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const billboard = await db.query.billboards.findFirst({
      where: eq(billboards.id, params.billboardId),
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!label) {
      return new NextResponse("Label is Required", { status: 400 });
    }
    if (!imageUrl) {
      return new NextResponse("Image URL is Required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store ID is Required", { status: 400 });
    }
    if (!params.billboardId) {
      return new NextResponse("Billboard ID is Required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const [billboard] = await db
      .update(billboards)
      .set({ label, imageUrl, updatedAt: new Date() })
      .where(eq(billboards.id, params.billboardId))
      .returning();

    return NextResponse.json(billboard);
  } catch (error: any) {
    console.log(`[BILLBOARD_PATCH] `, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is Required", { status: 400 });
    }
    if (!params.billboardId) {
      return new NextResponse("Billboard ID is Required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const [billboard] = await db
      .delete(billboards)
      .where(eq(billboards.id, params.billboardId))
      .returning();

    return NextResponse.json(billboard);
  } catch (error: any) {
    console.log(`[BILLBOARD_DELETE] `, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
