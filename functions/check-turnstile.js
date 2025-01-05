export async function onRequestPost(context) {
	const { request } = context;
	const body = await request.json();
	const token = body.turnstileToken;
	
	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({
		secret: env.TURNSTILE_SECRET_KEY,
		response: token,
	  }),
	});
  
	const result = await response.json();
  
	if (!result.success) {
	  return new Response("Turnstile falhou", { status: 403 });
	}
	return new Response("Turnstile validado com sucesso!", { status: 200 });
  }
  