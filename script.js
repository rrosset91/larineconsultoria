const stripe = Stripe("pk_test_51QdDLzBmLhzPvPbK22LYryolt7sNSMwzzMWzHW9RJJzlcxIlVmA3C2pjKCFjE1v4P8DJ3dad288z1gnHnHt7esxT00XGxVfmgp");

let validationMessage;
let validationHolder = document.getElementById("validationMessage");
let isTurnstileTokenValid = false;
let isValid = false;

const appearance = {
  theme: "minimal",
  variables: { colorPrimaryText: "#262626" },
};

// Máscara e validação do telefone
const phoneInput = document.getElementById("phone");
phoneInput.addEventListener("input", function () {
  let value = phoneInput.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  const formattedValue = value
    .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1)$2-$3")
    .replace(/^(\d{2})(\d{5})(\d{4})$/, "($1)$2-$3");
  phoneInput.value = formattedValue;
});

// Atualização dinâmica do botão "Enviar" e validação do formulário
const submitButton = document.getElementById("submit-btn");
const formFields = document.querySelectorAll("#customForm input, #customForm textarea, #customForm select");

formFields.forEach((field) => {
  field.addEventListener("input", validateForm);
});

function validateForm() {
  isValid = Array.from(formFields).every((field) => {
    if (field.required && field.type !== "file") {
      if (field.id === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(field.value);
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
  }

  // Ativa o botão somente se o Turnstile também foi validado
  submitButton.disabled = !isValid || submitButton.dataset.turnstileToken !== "true" || !isTurnstileTokenValid;
}

// Exibição condicional do upload de documentos com base na seleção do plano
document.getElementById("plan").addEventListener("change", function () {
  const uploadField = document.getElementById("documents");

  if (this.value === "Avulsa C/ Análise" || this.value === "Ilimitado Mensal" || this.value === "Ilimitado Anual") {
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

// Turnstile validação
document.addEventListener("DOMContentLoaded", () => {
  // Evento disparado quando o Turnstile é validado
  window.addEventListener("turnstile-response", async (event) => {
    const token = event.detail.token; // Token retornado pelo Turnstile
    if (token) {
      submitButton.dataset.turnstileToken = "true";
      validateForm(); // Revalida o formulário
    }
  });

  // Desativar o botão caso o Turnstile seja invalidado
  window.addEventListener("turnstile-error", () => {
    submitButton.dataset.turnstileToken = "false";
    submitButton.disabled = true;
  });
});

async function validateTurnstileToken(token) {
	const response = await fetch("https://larineconsultoria.pages.dev/check-turnstile", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ turnstileToken: token }),
	});

	if (response.ok) {
		console.log('@@@Turnstile is valid@@@');
		return true;
	} else {
		console.log('@@@Turnstile is notvalid@@@');
		return false;
	}
}

async function onTurnstileSuccess(token) {
	console.log("Turnstile validado com sucesso. Token:", token);
	let isValidToken = await validateTurnstileToken(token);
	submitButton.dataset.turnstileToken = "true";
	isTurnstileTokenValid = true;
  }
  
  function onTurnstileError() {
	submitButton.dataset.turnstileToken = "false";
	isTurnstileTokenValid = false;
  }
  

// Validação do arquivo enviado
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

// Inicializar PaymentIntent ao clicar no botão "Enviar"
submitButton.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    // Criar PaymentIntent no backend
    const response = await fetch("https://larineconsultoria.pages.dev/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 5000, currency: "brl" }), // Moeda BRL para suportar boleto
    });

    if (!response.ok) {
      throw new Error("Erro ao criar Payment Intent");
    }

    const { clientSecret } = await response.json();

    // Inicializar o Stripe Elements
    const elements = stripe.elements({ clientSecret, appearance });
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    // Confirmar o pagamento
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "/complete.html",
      },
    });

    if (error) {
      document.getElementById("error-message").textContent = error.message;
    } else {
      document.getElementById("error-message").textContent = "Pagamento processado com sucesso!";
    }
  } catch (error) {
    console.error("Erro ao inicializar Stripe:", error.message);
    document.getElementById("error-message").textContent = "Erro ao processar o pagamento.";
  }
});

// Lazy loading para imagens e elementos
document.addEventListener("DOMContentLoaded", () => {
  const lazyElements = document.querySelectorAll(".lazy-load");

  const observer = new IntersectionObserver((entries, observer) => {
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

  lazyElements.forEach((element) => {
    observer.observe(element);
  });

  let linkButtons = document.querySelectorAll(".buyBtn");
  linkButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const element = e.target;
      let definition = {};
      definition.id = element.getAttribute("id");
      definition.price = element.getAttribute("price");
      definition.billingType = element.getAttribute("price-type");
      definition.name = element.getAttribute("name");
      let planSelection = document.getElementById("plan");
      planSelection.value = definition.name;
      window.location.href = "#list-item-3";
    });
  });
});
