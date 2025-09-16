import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const add = mutation({
  args: {
    category: v.optional(
      v.union(
        v.literal("accessories"),
        v.literal("tops"),
        v.literal("bottoms"),
        v.literal("shoes")
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
    // If a category was provided and the user's currentItems for that category is empty,
    // set it to the newly added item.
    if (args.category) {
      const existing = await ctx.db
        .query("currentItems")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .unique();
      if (existing) {
        const alreadySet = (existing as any)[args.category];
        if (!alreadySet) {
          await ctx.db.patch(existing._id, { [args.category]: docId } as any);
        }
      } else {
        await ctx.db.insert(
          "currentItems",
          { user_id: userId, [args.category]: docId } as any
        );
      }
    }
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

export const listByCategory = query({
  args: {
    category: v.union(
      v.literal("accessories"),
      v.literal("tops"),
      v.literal("bottoms"),
      v.literal("shoes")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;
    const items = await ctx.db
      .query("items")
      .withIndex("by_user_category", (q) => q.eq("user_id", userId).eq("category", args.category))
      .collect();

    // Attach storage URL to each item if present
    const withUrls = await Promise.all(
      items.map(async (item) => {
        let url: string | null = null;
        if (item.image) {
          url = await ctx.storage.getUrl(item.image);
        }
        return { ...item, url } as const;
      })
    );

    // Reorder so the currently selected item for this category appears first (if any)
    const current = await ctx.db
      .query("currentItems")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();

    let currentSelectedId: Id<"items"> | undefined;
    if (current) {
      switch (args.category) {
        case "accessories":
          currentSelectedId = current.accessories;
          break;
        case "tops":
          currentSelectedId = current.tops;
          break;
        case "bottoms":
          currentSelectedId = current.bottoms;
          break;
        case "shoes":
          currentSelectedId = current.shoes;
          break;
      }
    }

    if (currentSelectedId) {
      const idx = withUrls.findIndex((it) => it._id === currentSelectedId);
      if (idx > 0) {
        const selected = withUrls[idx];
        const reordered = [selected, ...withUrls.slice(0, idx), ...withUrls.slice(idx + 1)];
        return reordered;
      }
    }

    return withUrls;
  },
});

export const listAllWithFilters = query({
  args: {
    search: v.optional(v.string()),
    season: v.optional(
      v.union(v.literal("spring"), v.literal("summer"), v.literal("autumn"), v.literal("winter"))
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;

    const all = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    const trimmed = (args.search || "").trim().toLowerCase();
    const tokens = trimmed.length > 0 ? trimmed.split(/\s+/).filter(Boolean) : [];

    const filtered = all.filter((item) => {
      if (args.season && item.season !== args.season) return false;
      if (args.color && item.color !== args.color) return false;

      if (tokens.length === 0) return true;
      const haystack = [item.brand || "", item.season || "", item.color || ""]
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });

    const withUrls = await Promise.all(
      filtered.map(async (item) => {
        let url: string | null = null;
        if (item.image) {
          url = await ctx.storage.getUrl(item.image);
        }
        return { ...item, url } as const;
      })
    );

    return withUrls;
  },
});

export const getByIdWithUrl = query({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;
    const item = await ctx.db.get(args.id);
    if (!item) return null;
    if (item.user_id !== userId) throw new Error("Forbidden");
    let url: string | null = null;
    if (item.image) {
      url = await ctx.storage.getUrl(item.image);
    }
    return { ...item, _id: args.id, url } as const;
  },
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;
    const current = await ctx.db
      .query("currentItems")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();
    return current ?? null;
  },
});

export const getCurrentWithUrls = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;

    const current = await ctx.db
      .query("currentItems")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();

    if (!current) return null;

    const loadItemWithUrl = async (itemId: Id<"items"> | undefined) => {
      if (!itemId) return null;
      const item = await ctx.db.get(itemId);
      if (!item) return null;
      let url: string | null = null;
      if (item.image) {
        url = await ctx.storage.getUrl(item.image);
      }
      return { ...item, _id: itemId, url } as const;
    };

    const [accessories, tops, bottoms, shoes] = await Promise.all([
      loadItemWithUrl(current.accessories),
      loadItemWithUrl(current.tops),
      loadItemWithUrl(current.bottoms),
      loadItemWithUrl(current.shoes),
    ]);

    return {
      accessories,
      tops,
      bottoms,
      shoes,
    };
  },
});

export const setCurrent = mutation({
  args: {
    category: v.union(
      v.literal("accessories"),
      v.literal("tops"),
      v.literal("bottoms"),
      v.literal("shoes")
    ),
    itemId: v.union(v.id("items"), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;

    // If setting a specific item, validate ownership and category match
    if (args.itemId !== null) {
      const item = await ctx.db.get(args.itemId);
      if (!item) throw new Error("Item not found");
      if (item.user_id !== userId) throw new Error("Forbidden");
      if (item.category !== args.category) throw new Error("Category mismatch");
    }

    const existing = await ctx.db
      .query("currentItems")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();

    const patch: Record<string, Id<"items"> | undefined> = {};
    // When itemId is null we clear the selection for the category
    patch[args.category] = args.itemId ?? undefined;

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    } else {
      const insertedId = await ctx.db.insert("currentItems", {
        user_id: userId,
        ...patch,
      } as any);
      return insertedId;
    }
  },
});

export const randomizeCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;

    // Helper to pick a random element or undefined if empty
    const pickRandom = <T,>(arr: readonly T[]): T | undefined => {
      if (!arr || arr.length === 0) return undefined;
      const idx = Math.floor(Math.random() * arr.length);
      return arr[idx];
    };

    // Load one random item per category for this user
    const [acc, tops, bottoms, shoes] = await Promise.all([
      ctx.db
        .query("items")
        .withIndex("by_user_category", (q) => q.eq("user_id", userId).eq("category", "accessories"))
        .collect(),
      ctx.db
        .query("items")
        .withIndex("by_user_category", (q) => q.eq("user_id", userId).eq("category", "tops"))
        .collect(),
      ctx.db
        .query("items")
        .withIndex("by_user_category", (q) => q.eq("user_id", userId).eq("category", "bottoms"))
        .collect(),
      ctx.db
        .query("items")
        .withIndex("by_user_category", (q) => q.eq("user_id", userId).eq("category", "shoes"))
        .collect(),
    ]);

    const accPick = pickRandom(acc);
    const topsPick = pickRandom(tops);
    const bottomsPick = pickRandom(bottoms);
    const shoesPick = pickRandom(shoes);

    // Explicitly set undefined for empty categories to clear previous selections
    const patch: {
      accessories?: Id<"items"> | undefined;
      tops?: Id<"items"> | undefined;
      bottoms?: Id<"items"> | undefined;
      shoes?: Id<"items"> | undefined;
    } = {
      accessories: accPick ? (accPick._id as Id<"items">) : undefined,
      tops: topsPick ? (topsPick._id as Id<"items">) : undefined,
      bottoms: bottomsPick ? (bottomsPick._id as Id<"items">) : undefined,
      shoes: shoesPick ? (shoesPick._id as Id<"items">) : undefined,
    };

    const existing = await ctx.db
      .query("currentItems")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, patch as any);
      return existing._id;
    } else {
      const id = await ctx.db.insert("currentItems", { user_id: userId, ...patch } as any);
      return id;
    }
  },
});

export const update = mutation({
  args: {
    id: v.id("items"),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Item not found");
    if (existing.user_id !== userId) throw new Error("Forbidden");

    const { id, ...rest } = args as any;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(id, patch);
    }
    // If the category changed and this item was selected as current for the old category,
    // clear it from currentItems so it doesn't point to an item of a different category.
    if (
      rest.category !== undefined &&
      existing.category &&
      rest.category !== existing.category
    ) {
      const current = await ctx.db
        .query("currentItems")
        .withIndex("by_user", (q) => q.eq("user_id", userId))
        .unique();
      if (current && (current as any)[existing.category] === id) {
        await ctx.db.patch(current._id, { [existing.category]: undefined } as any);
      }
    }
    return id as Id<"items">;
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Not authenticated");
    const userId = identity.subject;

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Item not found");
    if (existing.user_id !== userId) throw new Error("Forbidden");

    // Clear from currentItems if selected
    const current = await ctx.db
      .query("currentItems")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .unique();
    if (current) {
      const patch: Record<string, Id<"items"> | undefined> = {};
      if (current.accessories === args.id) patch.accessories = undefined;
      if (current.tops === args.id) patch.tops = undefined;
      if (current.bottoms === args.id) patch.bottoms = undefined;
      if (current.shoes === args.id) patch.shoes = undefined;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(current._id, patch);
      }
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});