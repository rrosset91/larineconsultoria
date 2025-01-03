export async function onRequestPost(context) {
	const { request, env } = context;
  
	const sig = request.headers.get("Stripe-Signature");
	const payload = await request.text();
  
	try {
	  const stripe = require("stripe")('sk_test_51QdDLzBmLhzPvPbKglzZmKrVcOuW7d4NgyOKngDkB0FptyY1yTC10rpgqm1lTXZ1IVJyVwCYVyV3JculRxSWSvA100Tqt65jWb');
	  const event = stripe.webhooks.constructEvent(payload, sig, 'sk_test_51QdDLzBmLhzPvPbKglzZmKrVcOuW7d4NgyOKngDkB0FptyY1yTC10rpgqm1lTXZ1IVJyVwCYVyV3JculRxSWSvA100Tqt65jWb');
  
	  if (event.type === "payment_intent.succeeded") {
		console.log("Pagamento bem-sucedido:", event.data.object);
	  }
  
	  return new Response("Webhook processed", { status: 200 });
	} catch (error) {
	  console.error("Erro no Webhook:", error.message);
	  return new Response("Webhook error", { status: 400 });
	}
  }
  