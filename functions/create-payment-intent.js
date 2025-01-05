export async function onRequestPost(context) {
	const { env, request } = context;
  
	try {
	  const stripe = require("stripe")(env.STRIPE_SECRET_KEY);
  
	  // Obter os dados enviados do frontend
	  const { amount, turnstileToken } = await request.json();
  
	  // Verificar se o token do Turnstile foi enviado
	  if (!turnstileToken) {
		return new Response(
		  JSON.stringify({ error: "Turnstile token is missing" }),
		  { status: 400 }
		);
	  }
  
	  // Validar o token do Turnstile com a API da Cloudflare
	  const turnstileResponse = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({
			secret: env.TURNSTILE_SECRET_KEY, // Chave secreta configurada no wrangler.toml
			response: turnstileToken,
		  }),
		}
	  );
  
	  const turnstileResult = await turnstileResponse.json();
  
	  // Verificar o resultado da validação do Turnstile
	  if (!turnstileResult.success) {
		return new Response(
		  JSON.stringify({ error: "Failed Turnstile validation" }),
		  { status: 403 }
		);
	  }
  
	  // Validar o valor enviado
	  if (!amount || amount <= 0) {
		return new Response(
		  JSON.stringify({ error: "Invalid amount" }),
		  { status: 400 }
		);
	  }
  
	  // Criar o PaymentIntent no Stripe
	  const paymentIntent = await stripe.paymentIntents.create({
		amount, // Valor em centavos
		currency: "brl", // Moeda BRL
		automatic_payment_methods: { enabled: true }, // Métodos automáticos
	  });
  
	  // Retornar o clientSecret para o frontend
	  return new Response(
		JSON.stringify({ clientSecret: paymentIntent.client_secret }),
		{ status: 200 }
	  );
	} catch (error) {
	  // Retornar erro caso algo dê errado
	  return new Response(
		JSON.stringify({ error: error.message }),
		{ status: 500 }
	  );
	}
  }
  