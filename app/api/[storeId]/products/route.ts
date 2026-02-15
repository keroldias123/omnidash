import { db } from "@/lib/db";
import { products, images, stores } from "@/lib/schema";
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
    const {
      name,
      price,
      categoryId,
      colorId,
      sizeId,
      images: imageUrls,
      isFeatured,
      isArchived,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!imageUrls || !imageUrls.length) {
      return new NextResponse("Images are required", { status: 400 });
    }
    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }
    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }
    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }
    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
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

    const [product] = await db
      .insert(products)
      .values({
        name,
        price: String(price),
        isFeatured: isFeatured || false,
        isArchived: isArchived || false,
        categoryId,
        colorId,
        sizeId,
        storeId: params.storeId,
      })
      .returning();

    // Insert images
    if (imageUrls.length > 0) {
      await db.insert(images).values(
        imageUrls.map((img: { url: string }) => ({
          url: img.url,
          productId: product.id,
        })),
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Build conditions
    const conditions = [
      eq(products.storeId, params.storeId),
      eq(products.isArchived, false),
    ];

    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (colorId) conditions.push(eq(products.colorId, colorId));
    if (sizeId) conditions.push(eq(products.sizeId, sizeId));
    if (isFeatured) conditions.push(eq(products.isFeatured, true));

    const result = await db.query.products.findMany({
      where: and(...conditions),
      with: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
