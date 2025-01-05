export async function onRequestPost(context) {
	const { request } = context;
	const body = await request.json();
	const token = body.turnstileToken;
  
	// Validar o token com a API do Turnstile
	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({
		secret: "0x4AAAAAAA4oB5jRR9gAVTs2p50_SWvfeds", // Chave secreta do Turnstile
		response: token,
	  }),
	});
  
	const result = await response.json();
  
	if (!result.success) {
	  return new Response("Turnstile falhou", { status: 403 });
	}
  
	// Processe o formulário (ex.: salvar no banco, enviar email, etc.)
	return new Response("Turnstile validado com sucesso!", { status: 200 });
  }
  