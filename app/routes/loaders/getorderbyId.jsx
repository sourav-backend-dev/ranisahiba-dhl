import { json } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import shopify from "../../shopify.server";

export async function loader({ params, request }) {
  const { admin, session } = await shopify.authenticate.admin(request);
  const orderId = params["*"];
  const order = await admin.rest.resources.Order.find({
    session,
    id: orderId,
  });

  return json(order);
}
