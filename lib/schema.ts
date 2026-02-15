import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  decimal,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ──────────────────────────── Stores ────────────────────────────

export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storesRelations = relations(stores, ({ many }) => ({
  billboards: many(billboards),
  categories: many(categories),
  sizes: many(sizes),
  colors: many(colors),
  products: many(products),
  orders: many(orders),
}));

// ──────────────────────────── Billboards ────────────────────────

export const billboards = pgTable("billboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 255 }).notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const billboardsRelations = relations(billboards, ({ one, many }) => ({
  store: one(stores, {
    fields: [billboards.storeId],
    references: [stores.id],
  }),
  categories: many(categories),
}));

// ──────────────────────────── Categories (hierarchical) ────────

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  billboardId: uuid("billboard_id").references(() => billboards.id, {
    onDelete: "set null",
  }),
  parentId: uuid("parent_id"),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  store: one(stores, {
    fields: [categories.storeId],
    references: [stores.id],
  }),
  billboard: one(billboards, {
    fields: [categories.billboardId],
    references: [billboards.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryHierarchy",
  }),
  children: many(categories, { relationName: "categoryHierarchy" }),
  products: many(products),
}));

// ──────────────────────────── Sizes ─────────────────────────────

export const sizes = pgTable("sizes", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sizesRelations = relations(sizes, ({ one, many }) => ({
  store: one(stores, {
    fields: [sizes.storeId],
    references: [stores.id],
  }),
  products: many(products),
}));

// ──────────────────────────── Colors ────────────────────────────

export const colors = pgTable("colors", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const colorsRelations = relations(colors, ({ one, many }) => ({
  store: one(stores, {
    fields: [colors.storeId],
    references: [stores.id],
  }),
  products: many(products),
}));

// ──────────────────────────── Products ──────────────────────────

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  sizeId: uuid("size_id")
    .notNull()
    .references(() => sizes.id),
  colorId: uuid("color_id")
    .notNull()
    .references(() => colors.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  size: one(sizes, {
    fields: [products.sizeId],
    references: [sizes.id],
  }),
  color: one(colors, {
    fields: [products.colorId],
    references: [colors.id],
  }),
  images: many(images),
  orderItems: many(orderItems),
}));

// ──────────────────────────── Images ────────────────────────────

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const imagesRelations = relations(images, ({ one }) => ({
  product: one(products, {
    fields: [images.productId],
    references: [products.id],
  }),
}));

// ──────────────────────────── Orders ────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  isPaid: boolean("is_paid").default(false).notNull(),
  phone: varchar("phone", { length: 50 }).default("").notNull(),
  address: text("address").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  orderItems: many(orderItems),
}));

// ──────────────────────────── Order Items ───────────────────────

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ──────────────────────────── Type exports ──────────────────────

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Billboard = typeof billboards.$inferSelect;
export type NewBillboard = typeof billboards.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Size = typeof sizes.$inferSelect;
export type NewSize = typeof sizes.$inferInsert;

export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ImageType = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
