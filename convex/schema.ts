import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(
  v.literal("image"),
  v.literal("pdf"),
  v.literal("csv")
);

export const rolesTypes = v.union(v.literal("admin"), v.literal("member"));

export default defineSchema({
  files: defineTable({
    title: v.string(),
    orgId: v.string(),
    type: fileTypes,
    storageId: v.id("_storage"),
    userId: v.id("users"),
  }).index("by_orgId", ["orgId"]),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(
      v.object({
        orgId: v.string(),
        role: rolesTypes,
      })
    ),
    name: v.string(),
    image: v.string(),
  }).index("by_identifier", ["tokenIdentifier"]),
  favorites: defineTable({
    userId: v.id("users"),
    orgId: v.string(),
    fileId: v.id("files"),
  }).index("by_user_by_org_by_file", ["userId", "orgId", "fileId"]),
});
