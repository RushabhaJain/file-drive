import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";

export const isPartOfOrg = async (
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) => {
  const user = await ctx.db
    .query("users")
    .withIndex("by_identifier", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .first();
  if (!user) {
    throw new ConvexError("Invalid user");
  }
  return user.orgIds.includes(orgId);
};

export const createFile = mutation({
  args: {
    title: v.string(),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to upload the file");
    }
    if (!isPartOfOrg(ctx, identity.tokenIdentifier, args.orgId)) {
      throw new ConvexError("User is not part of the organisation");
    }
    console.log(identity);
    await ctx.db.insert("files", {
      title: args.title,
      orgId: args.orgId,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to upload the file");
    }
    if (!isPartOfOrg(ctx, identity.tokenIdentifier, args.orgId)) {
      throw new ConvexError("User is not part of the organisation");
    }
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});
