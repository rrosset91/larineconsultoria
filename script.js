const TURNSTILE_PUBLIC_KEY = '0x4AAAAAAA4oB3KpfQXombi3';
const STRIPE_PUBLIC_KEY = 'pk_test_51QdDLzBmLhzPvPbK22LYryolt7sNSMwzzMWzHW9RJJzlcxIlVmA3C2pjKCFjE1v4P8DJ3dad288z1gnHnHt7esxT00XGxVfmgp';
let planPaymentLinks = {};
const stripe = Stripe(STRIPE_PUBLIC_KEY);

let validationMessage;
let isTurnstileTokenValid = false;
let isValid = false;

const validationHolder = document.getElementById("validationMessage");
const spinner = document.getElementById("spinner");
const payButton = document.getElementById("pay");
const payErrorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("submit-btn");
const formFields = document.querySelectorAll("#customForm input, #customForm textarea, #customForm select");
const phoneInput = document.getElementById("phone");

const appearance = {
	theme: "minimal",
	variables: { colorPrimaryText: "#262626" },
};

// Phone input formatting
phoneInput.addEventListener("input", () => {
	let value = phoneInput.value.replace(/\D/g, "");
	if (value.length > 11) value = value.slice(0, 11);
	phoneInput.value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1)$2-$3").replace(/^(\d{2})(\d{5})(\d{4})$/, "($1)$2-$3");
});

// Form validation
formFields.forEach((field) => field.addEventListener("input", validateForm));

function validateForm() {
	isValid = Array.from(formFields).every((field) => {
		if (field.required && field.type !== "file") {
			if (field.id === "email") {
				const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailPattern.test(field.value);
			}
			if (field.id === "plan") {
				if (!field.value || field.value === "None") {
					validationMessage = "Por favor, selecione um plano.";
					validationHolder.textContent = validationMessage;
					return false;
				}
				return true;
			}
			if (field.tagName === "TEXTAREA" && field.value.length < 300) {
				validationMessage = "O texto deve ter pelo menos 300 caracteres.";
				validationHolder.textContent = validationMessage;
				return false;
			}
			return field.value.trim() !== "";
		}
		return true;
	});

	if (isValid) {
		validationMessage = "";
		validationHolder.textContent = validationMessage;
		initializeTurnstile();
	}
}

// Plan selection logic
document.getElementById("plan").addEventListener("change", function () {
	const uploadField = document.getElementById("documents");

	if (["Avulsa C/ Análise", "Ilimitado Mensal"].includes(this.value)) {
		uploadField.disabled = false;
		validationMessage = "Por favor, envie os documentos necessários.";
		validationHolder.textContent = validationMessage;
		submitButton.disabled = true;
	} else {
		uploadField.disabled = true;
		validationHolder.textContent = "";
		validateForm();
	}
});

// Turnstile initialization
function initializeTurnstile() {
	const captchaHolder = document.getElementById("captcha-holder");
	if (captchaHolder) {
		captchaHolder.innerHTML = `<div class="cf-turnstile" data-sitekey="${TURNSTILE_PUBLIC_KEY}" data-callback="onTurnstileSuccess" data-error-callback="onTurnstileError"></div>`;
		if (typeof turnstile !== "undefined") turnstile.render(".cf-turnstile");
	}
}

// Turnstile validation
async function validateTurnstileToken(token) {
	const response = await fetch("/check-turnstile", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token }),
	});

	if (response.ok) {
		submitButton.disabled = false;
		return true;
	}
	return false;
}

async function onTurnstileSuccess(token) {
	await validateTurnstileToken(token);
	submitButton.dataset.turnstileToken = "true";
	isTurnstileTokenValid = true;
}

function onTurnstileError() {
	submitButton.dataset.turnstileToken = "false";
	isTurnstileTokenValid = false;
}

// File upload validation
document.getElementById("documents").addEventListener("change", function () {
	const maxSize = 10 * 1024 * 1024;
	const allowedFormats = ["image/png", "image/jpeg", "application/pdf", "application/msword"];
	const file = this.files[0];

	if (file && file.size > maxSize) {
		alert("O arquivo excede o tamanho máximo de 10MB.");
		this.value = "";
		return;
	}

	if (file && !allowedFormats.includes(file.type)) {
		alert("Formato inválido. Apenas arquivos PNG, JPG, PDF e DOC são permitidos.");
		this.value = "";
	}
});

// Form submission
submitButton.addEventListener("click", async (event) => {
	event.preventDefault();

	if (!isValid) {
		validationMessage = "Por favor, preencha o formulário corretamente.";
		validationHolder.textContent = validationMessage;
		return;
	}

	let selectedPlan = document.getElementById("plan").value;
	let link = planPaymentLinks[selectedPlan];
	const form = document.getElementById("customForm");
	const formData = new FormData(form);
	const files = document.getElementById("documents").files;

	for (let i = 0; i < files.length; i++) {
		formData.append("documents", files[i], files[i].name);
	}

	submitButton.disabled = true;
	submitButton.textContent = "Enviando...";

	try {
		const response = await fetch("/submit-request", {
			method: "POST",
			body: formData,
		});
		const result = await response.text();

		if (response.ok) {
			alert("Formulário enviado com sucesso!");
			form.reset();
		} else {
			alert("Erro ao enviar: " + result);
		}
	} catch (error) {
		alert("Erro na requisição: " + error.message);
	}

	if (link) {
		await new Promise((resolve) => {
			window.open(link, "_blank");
			resolve();
		});
		window.location.reload();
	}
});

// Lazy loading
document.addEventListener("DOMContentLoaded", () => {
	const lazyElements = document.querySelectorAll(".lazy-load");

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const element = entry.target;
				if (element.tagName === "IMG" && element.dataset.src) {
					element.src = element.dataset.src;
				}
				element.classList.add("lazy-loaded");
				observer.unobserve(element);
			}
		});
	});

	lazyElements.forEach((element) => observer.observe(element));

	let linkButtons = document.querySelectorAll(".buyBtn");
	linkButtons.forEach((button) => {
		button.addEventListener("click", (e) => {
			e.preventDefault();
			const element = e.target;
			let definition = {
				id: element.getAttribute("id"),
				price: element.getAttribute("price"),
				billingType: element.getAttribute("price-type"),
				name: element.getAttribute("name"),
			};
			document.getElementById("plan").value = definition.name;
			window.location.href = "#list-item-3";
		});
	});
});

// Fetch and populate data
document.addEventListener("DOMContentLoaded", async () => {
	formFields.forEach((field) => field.dispatchEvent(new Event("input", { bubbles: true })));

	try {
		const response = await fetch("/getdata");
		if (!response.ok) throw new Error("Failed to fetch data");

		const data = await response.json();
		let kv = {};
		for (const entry of data) {
			kv[entry.key] = entry.value;
		}

		planPaymentLinks['Avulsa Simples'] = kv["consultoria_simples_link"];
		planPaymentLinks['Avulsa C/ Análise'] = kv["consultoria_analise_link"];
		planPaymentLinks['Ilimitado Mensal'] = kv["assinatura_mensal_link"];

		await populateFrontEnd(kv);
	} catch (error) {
		console.error("Error fetching data:", error);
	}
});

async function populateFrontEnd(kv) {
	const simplesTitle = document.getElementById("consultoriaSimples");
	const analiseTitle = document.getElementById("consultoriaAnalise");
	const assinaturaMensal = document.getElementById("assinaturaMensal");
	const simplesPrice = document.getElementById("simplesPrice");
	const analisePrice = document.getElementById("analisePrice");
	const mensalPrice = document.getElementById("assinaturaPrice");

	simplesTitle.textContent = kv["consultoria_simples_display"];
	analiseTitle.textContent = kv["consultoria_analise_display"];
	assinaturaMensal.textContent = kv["assinatura_mensal_display"];

	simplesPrice.textContent = `R$${kv["consultoria_simples"]}`;
	analisePrice.textContent = `R$${kv["consultoria_analise"]}`;
	mensalPrice.textContent = `R$${kv["assinatura_mensal"]}*`;
}
