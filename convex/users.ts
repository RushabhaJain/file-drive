import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { rolesTypes } from "./schema";

export const createUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    image: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      orgIds: [],
      name: args.name,
      image: args.image,
    });
  },
});

export const assignOrgToUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    orgId: v.string(),
    role: rolesTypes,
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
      orgIds: [
        ...user.orgIds,
        {
          orgId: args.orgId,
          role: args.role,
        },
      ],
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

export const updateUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    image: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_identifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();
    if (!user) {
      throw new ConvexError("no user with this token found");
    }
    await ctx.db.patch(user._id, {
      name: args.name,
      image: args.image,
    });
  },
});

export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);
    return {
      name: user?.name,
      image: user?.image,
    };
  },
});

export const getMe = query({
  args: {},
  async handler(ctx) {
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

    return user;
  },
});
