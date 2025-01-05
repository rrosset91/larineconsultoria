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
  
  
	  if (!amount || amount <= 0) {
		return new Response(
		  JSON.stringify({ error: "Invalid amount" }),
		  { status: 400 }
		);
	  }
  
	  const paymentIntent = await stripe.paymentIntents.create({
		amount, 
		currency: "brl",
		automatic_payment_methods: { enabled: true },
	  });
  
	  return new Response(
		JSON.stringify({ clientSecret: paymentIntent.client_secret }),
		{ status: 200 }
	  );
	} catch (error) {
	  return new Response(
		JSON.stringify({ error: error.message }),
		{ status: 500 }
	  );
	}
  }
  