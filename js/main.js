document.addEventListener("DOMContentLoaded", () => {    

    const apiUrl = 'https://api.exchangeratesapi.io/latest?base=';
    const defaultBase = 'EUR';
    const fromBases = ['RUB', 'EUR', 'USD', 'ISK', 'GBP', 'JPY'];


    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");
    const calculateButton = document.getElementById("submit");
    const result = document.getElementById('result');
    const header = document.getElementById('header');
    const startUpdate = document.getElementById('start-update');
    const display = document.getElementById('timer');
    const currencyIcon = document.getElementById('currencyIcon');
    const amountInput = document.getElementById('amount');
    
    let currencyRatesData = {};
    let bases = [];


function getDataFromApi() {
    bases = [];
    Promise.all(fromBases.map(base => getCurrencyRateData(base))).then(values => {
        values.forEach(data => {
            bases.push(data.base);
            currencyRatesData[data.base] = data.rates;
        });

        currencyRatesData.date = values[0].date;
        
        renderDate(currencyRatesData.date);
        makeFromSelectors();
    });
}


function getCurrencyRateData(base) {
    return fetch(`${apiUrl}${base}`).then(
        res => res.json()
    );
}


function renderDate(date) {
    header.innerText = `Согласно курсу валют на ${moment(date).locale('ru').format('LL')}`;
}


function makeFromSelectors() {
    let headBases = [];
    let tailBases = [];
    bases.forEach(base => {
        if (base === defaultBase) {
            headBases.push(base);
        }  else  {
            tailBases.push(base);
        }
    });

    const sortedBases = headBases.concat(tailBases);

    renderOptions(sortedBases, fromCurrency);
    
    setCurrencyIcon(sortedBases[0]);
    makeToSelectors(sortedBases[0]);
}



function renderOptions(optionsList, target) {
    let template = '';
    optionsList.forEach(option => {
        template += `<option value="${option}">${option}</option>`;
    });
    target.innerHTML = template;
}



function setCurrencyIcon(base) {
    switch (base) {
        case 'USD':
            clearClassList(currencyIcon);
            currencyIcon.classList.add('fas', 'fa-dollar-sign');
            break;
        case 'EUR':
            clearClassList(currencyIcon);
            currencyIcon.classList.add('fas', 'fa-euro-sign');
            break;
        case 'RUB':
            clearClassList(currencyIcon);
            currencyIcon.classList.add('fas', 'fa-ruble-sign');
            break;
        default:
            clearClassList(currencyIcon);
            currencyIcon.classList.add('fas', 'fa-money-bill-wave');
            break;
    }
}


function clearClassList(element) {
    let classList = element.classList;
    while (classList.length > 0) {
        classList.remove(classList.item(0));
    }
}


function makeToSelectors(base) {
    let headKeys = [];
    let tailKeys = [];

    Object.keys(currencyRatesData[base]).forEach(key => {
        if (bases.indexOf(key) >= 0) {
            headKeys.push(key)
        } else {
            tailKeys.push(key)
        }
    });

    const sortedKeys = headKeys.concat(tailKeys);
    renderOptions(sortedKeys, toCurrency);
}

initListeners();
getDataFromApi();


function initListeners() {
    fromCurrency.addEventListener('change', fromCurrencyHandler);
    calculateButton.addEventListener('click', calculateButtonHandler);
}


function fromCurrencyHandler(event) {
    makeToSelectors(event.target.value);
    setCurrencyIcon(event.target.value);
}


function calculateButtonHandler() {
    validateAmount(amountInput);
    const resultData = {};
    resultData.amount = amountInput.value;
    resultData.fromCurrency = fromCurrency.value;
    resultData.toCurrency = toCurrency.value;
    resultData.factor = currencyRatesData[fromCurrency.value][toCurrency.value];

    renderResult(resultData, result);
}


function validateAmount(amountInput) {
    let amount = parseInt(amountInput.value, 10);

    if ((Number.isNaN(amount) === true) || (amount <= 0)) {
        amount = 1;
        amountInput.value = amount;
    } else if (amount > 100) {
        amount = 100;
        amountInput.value = amount;
    }
}


function renderResult({amount, fromCurrency, toCurrency, factor}, target) {
    target.innerHTML = `<h1 class="is-large">${amount} ${fromCurrency} = ${(amount * factor).toFixed(2)} ${toCurrency}</h1>`
}


});
