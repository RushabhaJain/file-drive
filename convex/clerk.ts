import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || ``;

export const fulfill = internalAction({
  args: {
    payload: v.string(),
    headers: v.any(),
  },
  async handler(ctx, args) {
    const wh = new Webhook(webhookSecret);
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent;
    return payload;
  },
});
