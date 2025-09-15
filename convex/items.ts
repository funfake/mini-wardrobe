import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const add = mutation({
  args: {
    category: v.optional(
      v.union(
        v.literal("jackets"),
        v.literal("tops"),
        v.literal("bottoms"),
        v.literal("shoes"),
        v.literal("accessories")
      )
    ),
    brand: v.optional(v.string()),
    season: v.optional(v.union(v.literal("spring"), v.literal("summer"), v.literal("autumn"), v.literal("winter"))),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject; // Clerk user id
    const docId = await ctx.db.insert("items", { ...args, user_id: userId });
    return docId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});


