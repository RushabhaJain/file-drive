import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(
  v.literal("image"),
  v.literal("pdf"),
  v.literal("csv")
);

export default defineSchema({
  files: defineTable({
    title: v.string(),
    orgId: v.string(),
    type: fileTypes,
    storageId: v.id("_storage"),
  }).index("by_orgId", ["orgId"]),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index("by_identifier", ["tokenIdentifier"]),
});
