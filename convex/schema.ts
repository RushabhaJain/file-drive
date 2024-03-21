import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  files: defineTable({
    title: v.string(),
    orgId: v.string(),
  }).index("by_orgId", ["orgId"]),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index("by_identifier", ["tokenIdentifier"]),
});
