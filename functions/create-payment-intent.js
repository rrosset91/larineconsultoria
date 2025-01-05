export async function onRequestPost(context) {
	const { env, request } = context;
  
	try {
	  const stripe = require("stripe")(env.STRIPE_SECRET_KEY);
  
	  // O body da requisição deve conter o valor (amount)
	  const { amount, currency = "eur" } = await request.json();
  
	  if (!amount || amount <= 0) {
		return new Response(
		  JSON.stringify({ error: "Invalid amount" }),
		  { status: 400 }
		);
	  }
  
	  // Criar Payment Intent
	  const paymentIntent = await stripe.paymentIntents.create({
		amount, // Valor em centavos
		currency: "brl", // Moeda padrão
		automatic_payment_methods: { enabled: true }, // Ativar métodos automáticos
	  });
  
	  return new Response(
		JSON.stringify({ clientSecret: paymentIntent.client_secret }),
		{ status: 200 }
	  );
	} catch (error) {
	  console.error("Erro ao criar Payment Intent:", error.message);
	  return new Response(
		JSON.stringify({ error: error.message }),
		{ status: 500 }
	  );
	}
  }
  