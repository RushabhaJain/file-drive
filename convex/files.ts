import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {
  const file = await ctx.db.get(fileId);
  if (!file) {
    return null;
  }
  const hasAccess = await hasAccessToOrg(ctx, file.orgId);
  if (!hasAccess) {
    return null;
  }
  return { user: hasAccess.user, file };
}

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_identifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    return null;
  }

  const hasAccess =
    user.orgIds.some((item) => item.orgId === orgId) ||
    user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    return null;
  }

  return { user };
}

export const generateUploadUrl = mutation({
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to upload the file");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const createFile = mutation({
  args: {
    title: v.string(),
    orgId: v.string(),
    type: fileTypes,
    storageId: v.id("_storage"),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      throw new ConvexError("You must be logged in to upload the file");
    }
    await ctx.db.insert("files", {
      title: args.title,
      orgId: args.orgId,
      storageId: args.storageId,
      type: args.type,
      userId: hasAccess.user._id,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    onlyFavorites: v.optional(v.boolean()),
    type: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }

    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const { query, onlyFavorites } = args;

    if (query) {
      files = files.filter((file) =>
        file.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (onlyFavorites) {
      // Get all favorites
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_user_by_org_by_file", (q) =>
          q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
        )
        .collect();

      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      );
    }

    if (args.type) {
      files = files.filter((file) => file.type === args.type);
    }

    return files;
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const doesHaveAccessToFile = await hasAccessToFile(ctx, args.fileId);
    if (!doesHaveAccessToFile) {
      throw new ConvexError("User is not part of the organisation");
    }
    const org = doesHaveAccessToFile.user.orgIds.find(
      (orgId) => orgId.orgId === doesHaveAccessToFile.file.orgId
    );

    if (org?.role !== "admin") {
      throw new ConvexError("You require admin access to delete this file");
    }

    await ctx.db.delete(doesHaveAccessToFile.file._id);
    await ctx.storage.delete(doesHaveAccessToFile.file.storageId);
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

export const toggleFavorite = mutation({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const doesUserHasAccessToFile = await hasAccessToFile(ctx, args.fileId);

    if (!doesUserHasAccessToFile) {
      throw new ConvexError("User cannot access this file");
    }

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_by_org_by_file", (q) =>
        q
          .eq("userId", doesUserHasAccessToFile.user._id)
          .eq("orgId", doesUserHasAccessToFile.file.orgId)
          .eq("fileId", args.fileId)
      )
      .first();
    if (favorite) {
      await ctx.db.delete(favorite?._id);
    } else {
      await ctx.db.insert("favorites", {
        userId: doesUserHasAccessToFile.user._id,
        orgId: doesUserHasAccessToFile.file.orgId,
        fileId: doesUserHasAccessToFile.file._id,
      });
    }
  },
});

export const getFavoriteFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      throw new ConvexError("You must be logged in to upload the file");
    }
    return await ctx.db
      .query("favorites")
      .withIndex("by_user_by_org_by_file", (q) =>
        q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
      )
      .collect();
  },
});
