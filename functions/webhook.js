export async function onRequestPost(context) {
	const { request, env } = context;
	
	const sig = request.headers.get("Stripe-Signature");
	const payload = await request.text();
	
	try {
	  console.log("Iniciando processamento do webhook...");
	  console.log("Payload recebido:", payload);
	  console.log("Assinatura recebida:", sig);
	
	  const stripe = require("stripe")(env.STRIPE_SECRET_KEY);
	  const event = stripe.webhooks.constructEvent(payload, sig, env.STRIPE_WEBHOOK_SECRET);
	
	  console.log("Evento validado:", event.type);
	
	  if (event.type === "payment_intent.succeeded") {
		console.log("Pagamento bem-sucedido:", event.data.object);
	  }
	
	  return new Response("Webhook processed", { status: 200 });
	} catch (error) {
	  console.error("Erro no Webhook:", error.message);
	  return new Response("Webhook error", { status: 400 });
	}
  }
  
  