export default {
	async fetch(request, env, ctx) {
		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405 });
		}

		const formData = await request.formData();

		const attachments = [];
		const files = formData.getAll("documents");
		for (const file of files) {
			const arrayBuffer = await file.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
			const base64 = btoa(binary);

			attachments.push({
				filename: file.name,
				content: base64,
			});
		}

		const emailText = `
Nova consulta recebida:

Nome: ${formData.get("fullName")}
Cidade: ${formData.get("city")}
Telefone: ${formData.get("phone")}
Email: ${formData.get("email")}
Plano: ${formData.get("plan")}
Resumo: ${formData.get("message")}
		`;

		const payload = {
			from: "consultorialarine@gmail.com",
			to: "consultorialarine@gmail.com",
			subject: "NOVO PEDIDO NO SITE",
			text: emailText,
			attachments,
		};

		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const result = await response.text();
		return new Response(result, { status: response.status });
	},
};
