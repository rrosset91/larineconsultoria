const stripe = Stripe("pk_test_51QdDLzBmLhzPvPbK22LYryolt7sNSMwzzMWzHW9RJJzlcxIlVmA3C2pjKCFjE1v4P8DJ3dad288z1gnHnHt7esxT00XGxVfmgp");

const appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#0570de",
    colorBackground: "#f8f9fa",
    colorText: "#30313d",
  },
};

// Inicialização do Stripe Elements e do PaymentIntent
(async function initialize() {
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

    // Formulário de pagamento - Submit
    const form = document.getElementById("payment-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "https://seu-site.pages.dev/sucesso", // URL para redirecionamento após pagamento
        },
      });

      if (error) {
        // Exibir mensagem de erro ao usuário
        document.getElementById("error-message").textContent = error.message;
      } else {
        document.getElementById("error-message").textContent = "Pagamento processado com sucesso!";
      }
    });
  } catch (error) {
    console.error("Erro ao inicializar Stripe:", error.message);
  }
})();

// Máscara e validação do telefone
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function () {
  let value = phoneInput.value.replace(/\D/g, ""); // Remove caracteres não numéricos
  if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
  const formattedValue = value
    .replace(/^(\d{2})(\d{4})(\d{4})$/, "($1)$2-$3") // Formato (xx)xxxx-xxxx
    .replace(/^(\d{2})(\d{5})(\d{4})$/, "($1)$2-$3"); // Formato (xx)xxxxx-xxxx
  phoneInput.value = formattedValue;
});

// Atualização dinâmica do botão "Enviar" e validação do formulário
const submitButton = document.getElementById('submit-btn');
const formFields = document.querySelectorAll('#customForm input, #customForm textarea, #customForm select');
formFields.forEach(field => {
  field.addEventListener('input', validateForm);
});

function validateForm() {
  const isValid = Array.from(formFields).every((field) => {
    if (field.required && field.type !== "file") {
      return field.value.trim() !== "";
    }
    return true;
  });

  submitButton.disabled = !isValid;
}

// Exibição condicional do upload de documentos com base na seleção do plano
document.getElementById('plan').addEventListener('change', function () {
  const uploadField = document.getElementById('documents');

  if (this.value === 'Avulsa C/ Análise' || this.value === 'Ilimitado Mensal' || this.value === 'Ilimitado Anual') {
    uploadField.disabled = false;
  } else {
    uploadField.disabled = true;
  }
});

// Validação do arquivo enviado
document.getElementById('documents').addEventListener('change', function () {
  const maxSize = 10 * 1024 * 1024;
  const allowedFormats = ['image/png', 'image/jpeg', 'application/pdf', 'application/msword'];
  const file = this.files[0];

  if (file && file.size > maxSize) {
    alert('O arquivo excede o tamanho máximo de 10MB.');
    this.value = '';
    return;
  }

  if (file && !allowedFormats.includes(file.type)) {
    alert('Formato inválido. Apenas arquivos PNG, JPG, PDF e DOC são permitidos.');
    this.value = '';
  }
});

// Lazy loading para imagens e elementos
document.addEventListener('DOMContentLoaded', () => {
  const lazyElements = document.querySelectorAll(".lazy-load");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
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

  lazyElements.forEach(element => {
    observer.observe(element);
  });

  let linkButtons = document.querySelectorAll('.buyBtn');
  linkButtons.forEach((button) => {
    let plansData = data;
    let planIndex = Array.from(linkButtons).indexOf(button);
    if (plansData && plansData[planIndex]) {
      button.setAttribute('id', plansData[planIndex].id);
      button.setAttribute('price', plansData[planIndex].price);
      button.setAttribute('price-type', plansData[planIndex].billingType);
      button.setAttribute('name', plansData[planIndex].name);
    }
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const element = e.target;
      let definition = {};
      definition.id = element.getAttribute('id');
      definition.price = element.getAttribute('price');
      definition.billingType = element.getAttribute('price-type');
      definition.name = element.getAttribute('name');
      let planSelection = document.getElementById('plan');
      planSelection.value = definition.name;
      window.location.href = '#list-item-3';
    });
  });
});
