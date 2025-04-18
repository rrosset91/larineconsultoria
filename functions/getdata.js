export async function onRequestGet(context) {
	const kvNamespace = context.env.larineconsultoria;

	try {
		const keys = await kvNamespace.list();
		const entries = await Promise.all(
			keys.keys.map(async (key) => {
				const value = await kvNamespace.get(key.name);
				return { key: key.name, value };
			})
		);

		return new Response(JSON.stringify(entries), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response('Error fetching data from KV', { status: 500 });
	}
}