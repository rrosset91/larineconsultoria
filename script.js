const stripe = Stripe("pk_test_51QdDLzBmLhzPvPbK22LYryolt7sNSMwzzMWzHW9RJJzlcxIlVmA3C2pjKCFjE1v4P8DJ3dad288z1gnHnHt7esxT00XGxVfmgp"); // Substitua com sua chave pública

    async function initialize() {
      const response = await fetch("/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 5000 }) // Exemplo: 50,00 EUR
      });
      const { clientSecret } = await response.json();

      const elements = stripe.elements({ clientSecret });
      const paymentElement = elements.create("payment");
      paymentElement.mount("#payment-element");

      const form = document.getElementById("payment-form");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: "https://seu-site.pages.dev/sucesso" // URL para redirecionar após sucesso
          }
        });

        if (error) {
          document.getElementById("error-message").textContent = error.message;
        }
      });
    }

    initialize();

let data;
document.getElementById('plan').addEventListener('change', function() {
	var uploadField = document.getElementById('documents');
	let submitButton = document.getElementById('submit-btn');
	submitButton.disabled = false;
	
	if (this.value === 'Avulsa C/ Análise' || this.value === 'Ilimitado Mensal' || this.value === 'Ilimitado Anual') {
		uploadField.disabled = false; 
	} else {
		uploadField.disabled = true; 
	}


});
document.getElementById('documents').addEventListener('change', function() {
	var maxSize = 10 * 1024 * 1024;
	var allowedFormats = ['image/png', 'image/jpeg', 'application/pdf', 'application/msword'];
	var file = this.files[0];

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

window.onload = async function () {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log('Conteúdo do JSON:', jsonData.plans);
		data = jsonData.plans;
    } catch (error) {
        console.error('Erro ao ler o JSON:', error);
    }
};

window.addEventListener("load", function () {
	window.scrollTo(0, 0);
});

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