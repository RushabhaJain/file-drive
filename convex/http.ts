import { HttpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const httpRouter = new HttpRouter();

httpRouter.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headers = request.headers;

    try {
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headers.get("svix-id")!,
          "svix-timestamp": headers.get("svix-timestamp")!,
          "svix-signature": headers.get("svix-signature")!,
        },
      });
      switch (result.type) {
        case "user.created":
          await ctx.runMutation(internal.users.createUser, {
            tokenIdentifier:
              "https://excited-rhino-79.clerk.accounts.dev|" + result.data.id,
          });
          break;
        case "organizationMembership.created":
          await ctx.runMutation(internal.users.assignOrgToUser, {
            tokenIdentifier:
              "https://excited-rhino-79.clerk.accounts.dev|" +
              result.data.public_user_data.user_id,
            orgId: result.data.organization.id,
          });
          break;
      }
      return new Response(null, {
        status: 200,
      });
    } catch (err) {
      return new Response("Webhook error", {
        status: 400,
      });
    }

    return new Response();
  }),
});

export default httpRouter;
