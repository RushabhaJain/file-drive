import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { fileTypes } from "./schema";

export const generateUploadUrl = mutation({
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to upload the file");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

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
    type: fileTypes,
    storageId: v.id("_storage"),
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
      storageId: args.storageId,
      type: args.type,
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

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to upload the file");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      return new ConvexError("File does not exist!");
    }
    if (!isPartOfOrg(ctx, identity.tokenIdentifier, file.orgId)) {
      throw new ConvexError("User is not part of the organisation");
    }
    await ctx.db.delete(file._id);
    await ctx.storage.delete(file.storageId);
  },
});

export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  async handler(ctx, args) {
    return await ctx.storage.getUrl(args.storageId);
  },
});
