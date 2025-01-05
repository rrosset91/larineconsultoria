export default {
	async onRequestGet(request) {
	  const url = new URL(request.url);
  
	  if (url.pathname === '/complete') {
		const htmlContent = `
		  <!DOCTYPE html>
		  <html lang="en">
		  <head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Pagamento Completo</title>
		  </head>
		  <body>
			<h1>Pagamento Concluído!</h1>
			<p>Obrigado por sua compra.</p>
		  </body>
		  </html>
		`;
  
		return new Response(htmlContent, {
		  headers: { 'Content-Type': 'text/html' },
		});
	  }
  
	  return new Response('Not Found', { status: 404 });
	},
  };
  