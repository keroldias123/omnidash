import { db } from "@/lib/db";
import { billboards, stores } from "@/lib/schema";
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
    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }
    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const [billboard] = await db
      .insert(billboards)
      .values({ label, imageUrl, storeId: params.storeId })
      .returning();

    return NextResponse.json(billboard);
  } catch (error) {
    console.log(`[BILLBOARDS_POST] ${error}`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const result = await db.query.billboards.findMany({
      where: eq(billboards.storeId, params.storeId),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log(`[BILLBOARDS_GET] ${error}`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
