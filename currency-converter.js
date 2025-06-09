const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");

const API_KEY = "5b48e0431c8fa02f4676f7c4";

async function fetchCountries() {
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies,flags");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch countries:", err);
  }
}

async function populateCurrencies() {
  const countries = await fetchCountries();
  const seen = new Set();

  countries.forEach(country => {
    if (!country.currencies) return;

    const [code] = Object.keys(country.currencies);
    const currency = country.currencies[code];

    if (!code || seen.has(code)) return;
    seen.add(code);

    const optionText = `${code} - ${currency.name}`;
    const option = new Option(optionText, code);

    fromSelect.appendChild(option.cloneNode(true));
    toSelect.appendChild(option);
  });

  fromSelect.value = "USD";
  toSelect.value = "INR";
}

document.getElementById("convert-currency-button").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("amount").value);
  const fromCurrency = fromSelect.value;
  const toCurrency = toSelect.value;

  if (isNaN(amount) || amount <= 0) {
    showError("Please enter a valid amount.");
    return;
  }

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`);
    const data = await res.json();

    if (!data.conversion_rates[toCurrency]) {
      throw new Error("Currency not supported.");
    }

    const rate = data.conversion_rates[toCurrency];
    const converted = (amount * rate).toFixed(2);

    resultEl.textContent = `${amount} ${fromCurrency} = ${converted} ${toCurrency}`;
    resultEl.classList.remove("hidden");
    errorEl.classList.add("hidden");
  } catch (err) {
    showError("An error occurred, please try again later");
    console.error(err);
  }
});

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  resultEl.classList.add("hidden");
}

populateCurrencies();
