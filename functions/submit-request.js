export const onRequestPost = async ({ request, env }) => {
	if (request.method !== "POST") {
	  return new Response("Method not allowed", { status: 405 });
	}
  
	// Extrair dados do formulário
	const formData = await request.formData();
  
	// Preparar os anexos
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
  
	// Construir o corpo do email
	const emailText = `
	<html>
	  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; padding: 20px;">
		<div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
		  <h2 style="color: #5c5c5c;">Nova consulta recebida:</h2>
		  <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;"><strong style="color: #555;">Nome:</strong> ${formData.get("fullName")}</p>
		  <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;"><strong style="color: #555;">Cidade:</strong> ${formData.get("city")}</p>
		  <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;"><strong style="color: #555;">Telefone:</strong> ${formData.get("phone")}</p>
		  <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;"><strong style="color: #555;">Email:</strong> ${formData.get("email")}</p>
		  <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;"><strong style="color: #555;">Plano:</strong> ${formData.get("plan")}</p>
		  <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;"><strong style="color: #555;">Resumo:</strong></p>
		  <p style="font-size: 16px; line-height: 1.5; color: #333;">${formData.get("message")}</p>
		</div>
	  </body>
	</html>
  `;
  
  
	const payload = {
	  from: "naoresponda@larineconsultoria.com",
	  to: "consultorialarine@gmail.com",
	  subject: "NOVO PEDIDO NO SITE",
	  text: emailText,
	  attachments,
	};
  
	// Enviar o email via API do Resend
	const response = await fetch("https://api.resend.com/emails", {
	  method: "POST",
	  headers: {
		Authorization: `Bearer ${env.RESEND_API_KEY}`,
		"Content-Type": "application/json",
	  },
	  body: JSON.stringify(payload),
	});
  
	// Resposta do envio
	const result = await response.text();
	return new Response(result, { status: response.status });
  };
  