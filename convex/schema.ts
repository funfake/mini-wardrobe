import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    category: v.optional(
      v.union(
        v.literal("accessories"),
        v.literal("tops"),
        v.literal("bottoms"),
        v.literal("shoes")
      )
    ),
    brand: v.optional(v.string()),
    season: v.optional(
      v.union(
        v.literal("spring"),
        v.literal("summer"),
        v.literal("autumn"),
        v.literal("winter")
      )
    ),
    color: v.optional(
      v.union(
        v.literal("black"),
        v.literal("white"),
        v.literal("gray"),
        v.literal("navy"),
        v.literal("blue"),
        v.literal("red"),
        v.literal("green"),
        v.literal("yellow"),
        v.literal("brown"),
        v.literal("beige"),
        v.literal("pink"),
        v.literal("purple"),
        v.literal("orange"),
        v.literal("olive")
      )
    ),
    image: v.optional(v.id("_storage")),
    size: v.optional(v.string()),
    user_id: v.string(), // from clerk
  })
  .index("by_user", ["user_id"])
  .index("by_user_category", ["user_id", "category"]),

  currentItems: defineTable({
    user_id: v.string(),
    accessories: v.optional(v.id("items")),
    tops: v.optional(v.id("items")),
    bottoms: v.optional(v.id("items")),
    shoes: v.optional(v.id("items")),
  }).index("by_user", ["user_id"]),
});