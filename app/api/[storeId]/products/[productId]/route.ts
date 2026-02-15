import { db } from "@/lib/db";
import { products, images, stores } from "@/lib/schema";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } },
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await db.query.products.findFirst({
      where: eq(products.id, params.productId),
      with: {
        category: true,
        color: true,
        size: true,
        images: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
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

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!categoryId)
      return new NextResponse("Category Id is required", { status: 400 });
    if (!colorId)
      return new NextResponse("Color Id is required", { status: 400 });
    if (!sizeId)
      return new NextResponse("Size Id is required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!imageUrls || imageUrls.length === 0)
      return new NextResponse("Images are required", { status: 400 });
    if (!params.productId)
      return new NextResponse("Product ID is required", { status: 400 });

    // Update product
    await db
      .update(products)
      .set({
        name,
        price: String(price),
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured || false,
        isArchived: isArchived || false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, params.productId));

    // Delete old images and insert new ones
    await db.delete(images).where(eq(images.productId, params.productId));

    await db.insert(images).values(
      imageUrls.map((img: { url: string }) => ({
        url: img.url,
        productId: params.productId,
      })),
    );

    const product = await db.query.products.findFirst({
      where: eq(products.id, params.productId),
      with: { images: true },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.log(`[PRODUCT_PATCH] `, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is Required", { status: 400 });
    }
    if (!params.productId) {
      return new NextResponse("Product ID is Required", { status: 400 });
    }

    const storeByUserId = await db.query.stores.findFirst({
      where: and(eq(stores.id, params.storeId), eq(stores.userId, userId)),
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Images will be cascade-deleted
    const [product] = await db
      .delete(products)
      .where(eq(products.id, params.productId))
      .returning();

    return NextResponse.json(product);
  } catch (error: any) {
    console.log(`[PRODUCT_DELETE] `, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
