const TURNSTILE_PUBLIC_KEY = '0x4AAAAAAA4oB3KpfQXombi3';
const STRIPE_PUBLIC_KEY = 'pk_test_51QdDLzBmLhzPvPbK22LYryolt7sNSMwzzMWzHW9RJJzlcxIlVmA3C2pjKCFjE1v4P8DJ3dad288z1gnHnHt7esxT00XGxVfmgp';

const stripe = Stripe(STRIPE_PUBLIC_KEY);
let validationMessage;
let validationHolder = document.getElementById("validationMessage");
let isTurnstileTokenValid = false;
let isValid = false;
let spinner = document.getElementById("spinner");
let payButton = document.getElementById("pay");
let payErrorMessage = document.getElementById("error-message");
const submitButton = document.getElementById("submit-btn");
const formFields = document.querySelectorAll("#customForm input, #customForm textarea, #customForm select");

const appearance = {
  theme: "minimal",
  variables: { colorPrimaryText: "#262626" },
};

const phoneInput = document.getElementById("phone");
phoneInput.addEventListener("input", () => {
  let value = phoneInput.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  phoneInput.value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1)$2-$3").replace(/^(\d{2})(\d{5})(\d{4})$/, "($1)$2-$3");
});

formFields.forEach((field) => field.addEventListener("input", validateForm));

document.addEventListener("animationstart", (event) => {
  if (event.animationName === "onAutoFillStart") {
    handleAutoComplete(event.target);
  }
});

function handleAutoComplete(field) {
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

document.addEventListener("DOMContentLoaded", () => {
  formFields.forEach((field) => field.dispatchEvent(new Event("input", { bubbles: true })));
});

function validateForm() {
  isValid = Array.from(formFields).every((field) => {
    if (field.required && field.type !== "file") {
      if (field.id === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(field.value);
      }
	if (field.id === "plan") {
	  if (field.value === "" || field.value === "None" || field.value === undefined || field.value === '') {
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

document.getElementById("plan").addEventListener("change", function () {
  const uploadField = document.getElementById("documents");

  if (["Avulsa C/ Análise", "Ilimitado Mensal", "Ilimitado Anual"].includes(this.value)) {
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

document.addEventListener("DOMContentLoaded", () => {
  formFields.forEach((field) => field.dispatchEvent(new Event("input", { bubbles: true })));
  window.addEventListener("turnstile-response", async (event) => {
    const token = event.detail.token;
    if (token) {
      submitButton.dataset.turnstileToken = "true";
      validateForm();
    }
  });
  window.addEventListener("turnstile-error", () => {
    submitButton.dataset.turnstileToken = "false";
    submitButton.disabled = true;
  });
});

function initializeTurnstile() {
  const captchaHolder = document.getElementById("captcha-holder");
  if (captchaHolder) {
    captchaHolder.innerHTML = `<div class="cf-turnstile" data-sitekey="${TURNSTILE_PUBLIC_KEY}" data-callback="onTurnstileSuccess" data-error-callback="onTurnstileError"></div>`;
    if (typeof turnstile !== "undefined") turnstile.render(".cf-turnstile");
  }
}

async function validateTurnstileToken(token) {
  const response = await fetch("/check-turnstile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turnstileToken: token }),
  });

  if (response.ok) {
    submitButton.disabled = false;
    return true;
  }
  return false;
}

async function onTurnstileSuccess(token) {
  let isValidToken = await validateTurnstileToken(token);
  submitButton.dataset.turnstileToken = "true";
  isTurnstileTokenValid = true;
}

function onTurnstileError() {
  submitButton.dataset.turnstileToken = "false";
  isTurnstileTokenValid = false;
}

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

submitButton.addEventListener("click", async (event) => {
  event.preventDefault();
  spinner.style.display = "block";
  payButton.style.display = "none";
  payErrorMessage.style.display = "none";
  try {
    const response = await fetch("/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 5000, currency: "brl" }),
    });

    if (!response.ok) {
      payErrorMessage.style.display = "block";
      throw new Error("Erro ao criar Payment Intent");
    }
    spinner.style.display = "none";
    payButton.style.display = "block";

    const { clientSecret } = await response.json();
    const elements = stripe.elements({ clientSecret, appearance });
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: "/complete" },
    });

    if (error) {
      payErrorMessage.textContent = error.message;
    } else {
      payErrorMessage.textContent = "Pagamento processado com sucesso!";
    }
  } catch (error) {
    payErrorMessage.textContent = "Erro ao processar o pagamento.";
  }
});

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
