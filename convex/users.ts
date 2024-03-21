import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const createUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      orgIds: [],
    });
  },
});

export const assignOrgToUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_identifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();
    if (!user) {
      throw new ConvexError("User does not exist");
    }
    await ctx.db.patch(user._id, {
      orgIds: [...user.orgIds, args.orgId],
    });
  },
});

export const getUser = internalQuery({
  args: {
    tokenIdentifier: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("users")
      .withIndex("by_identifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();
  },
});
