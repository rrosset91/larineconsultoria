export async function onRequestPost(context) {
	const { env, request } = context;
  
	try {
	  const stripe = require("stripe")(env.STRIPE_SECRET_KEY);
	  const { amount } = await request.json();
	  
  
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
  