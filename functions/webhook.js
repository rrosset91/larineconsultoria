export async function onRequestPost(context) {
	const { request, env } = context;
  
	const sig = request.headers.get("Stripe-Signature");
	const payload = await request.text(); // Obter o payload bruto como texto
  
	try {
	  console.log("Processando webhook...");
  
	  const stripe = require("stripe")(env.STRIPE_SECRET_KEY);
  
	  // Use constructEventAsync para validação da assinatura
	  const event = await stripe.webhooks.constructEventAsync(
		payload,
		sig,
		env.STRIPE_WEBHOOK_SECRET
	  );
  
	  console.log("Evento recebido:", event.type);
  
	  // Processar eventos específicos
	  if (event.type === "payment_intent.succeeded") {
		console.log("Pagamento bem-sucedido:", event.data.object);
	  }
  
	  return new Response("Webhook processado com sucesso", { status: 200 });
	} catch (error) {
	  console.error("Erro no Webhook:", error.message);
	  return new Response("Erro ao processar webhook", { status: 400 });
	}
  }
  