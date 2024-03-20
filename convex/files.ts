import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createFile = mutation({
  args: {
    title: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to upload the file");
    }
    console.log(identity);
    await ctx.db.insert("files", {
      title: args.title,
    });
  },
});

export const getFiles = query({
  args: {},
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to upload the file");
    }
    return await ctx.db.query("files").collect();
  },
});
