export async function onRequestPost(context) {
	const { env , request } = context;
	const body = await request.json();
	const token = body.token;
  
	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({
		secret: env.TURNSTILE_SECRET_KEY,
		response: token,
	  }),
	});
  
	const result = await response.json();
	console.log('@@@@Result is',result);
	if (!result.success) {
	  return new Response("Turnstile falhou", { status: 403 });
	}
	return new Response("Turnstile validado com sucesso!", { status: 200 });
  }
  