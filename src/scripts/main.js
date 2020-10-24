import {Exchanger} from "./exchanger.js";
import {ChartController} from "./chart-controller.js";
import {DateController} from "./date-controller.js";

let currenciesElem = document.querySelector(".currencies"),
    currenciesMoreElem = currenciesElem.querySelector(".currencies__more"),
    currenciesContainerElem = currenciesElem.querySelector(".currencies__wrapper"),
    currenciesPopupElem = currenciesElem.querySelector(".currencies__popup"),
    ctx = document.querySelector(".chart"),
    dateStart = document.querySelector("#dateStart"),
    dateEnd = document.querySelector("#dateEnd"),
    searchIntervalRateBtn = document.querySelector(".date__search"),
    tableElem = document.querySelector(".table"),
    tableSearchElem = document.querySelector(".table-search"),
    tabElem = document.querySelector(".tab");

let dateController = new DateController(dateStart, dateStart);
let exchanger = new Exchanger();
let currencies, currenciesCount = 7;
let chart;

new Promise((resolve, reject) => {
    if (!isChartExist()) {
        let script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js@2.8.0";
        script.onload = () => resolve();
        script.onerror = () => {
            alert("Something go wrong");
            reject();
        }
    } else
        resolve();
})
    .then(() => initDate())
    .then(() => initCurrencies())
    .then(() => initChart())
    .then(() => initTable())
    .then(() => initEvents())
    .then(() => alert("The widget works only with a chart. Dates are available in it from today to a year ago. " +
        "if the date does not fit, the chart of the selected currencies will be plotted on an interval of 30 days and " +
        "widget will be colored in red. The table and the graph are plotted depending on the selected exchange rates"));

// INITIALIZE FUNCTIONS

function initEvents() {
    currenciesMoreElem.addEventListener("click", (event) => {
        currenciesPopupElem.classList.toggle("hidden");
        event.preventDefault();
    });
    currenciesElem.addEventListener("click", checkCurrenciesEvent);
    dateStart.addEventListener("change", updateDateEvent);
    dateEnd.addEventListener("change", updateDateEvent);
    searchIntervalRateBtn.addEventListener("click", searchIntervalRateEvent);
    tableSearchElem.addEventListener("keyup", updateTableEvent);
    tabElem.addEventListener("click", changeTabEvent);
    window.addEventListener("beforeunload", () => {
        if (currencies)
            localStorage.setItem("currencies", JSON.stringify(currencies));

        if (dateStart.value && dateEnd.value) {
            localStorage.setItem("dateStart", JSON.stringify(dateStart.value));
            localStorage.setItem("dateEnd", JSON.stringify(dateEnd.value));
        }
    })
}

function initDate() {
    let time = new Date();

    dateStart.value = JSON.parse(localStorage.getItem("dateStart"));
    dateEnd.value = JSON.parse(localStorage.getItem("dateEnd"));

    dateStart.max = time.toLocaleDateString().replaceAll(".", "-");
    dateStart.min = new Date(time.getFullYear() - 1, time.getMonth(), time.getDate()).toLocaleDateString().replaceAll(".", "-");

    dateEnd.max = time.toLocaleDateString().replaceAll(".", "-");
    dateEnd.min = new Date(time.getFullYear() - 1, time.getMonth(), time.getDate()).toLocaleDateString().replaceAll(".", "-");
}

async function initTable() {
    tableElem.innerHTML = "";

    let date = dateController.getWeekSet();
    date.labels.splice(0, 0, "");
    tableElem.appendChild(createTableRow(-1, date.labels, "th"));

    await Promise.all(currencies.map(async currency => {
        let data = await exchanger.getRatePeriod(currency.id, date.start, date.end);

        let max = data.indexOf(Math.max(...data));
        let min = data.indexOf(Math.min(...data));

        data.splice(0, 0, currency.code);

        tableElem.appendChild(createTableRow(currency.id, data, "td", currency.selected, {
            maxIndex: max + 1,
            minIndex: min + 1
        }));
    }));
}

async function initCurrencies() {
    currencies = JSON.parse(localStorage.getItem("currencies")) || await exchanger.getCurrenciesNames();
    updateCurrencies(currencies);
}

async function initChart() {
    chart = new ChartController(ctx);
    updateChart(new Date(dateStart.value), new Date(dateEnd.value));
}

// EVENTS

function updateDateEvent(event) {
    if (dateController.checkDates(new Date(dateStart.value), new Date(dateEnd.value))) {
        dateStart.style.background = "white";
        dateEnd.style.background = "white";
    } else {
        dateStart.style.background = "#f07b73";
        dateEnd.style.background = "#f07b73";
        // alert("Данные каленаря введены неверно, будет выведен график за прошлый месяц");
    }
}

function checkCurrenciesEvent(event) {
    if (event.target.classList.contains("currency__checkbox")) {
        let id = parseInt(event.target.parentElement.dataset.id);
        let currency = currencies.find(cur => cur.id === id);
        currency.selected = !currency.selected;
        updateCurrencies(currencies, this);
        updateChart(new Date(dateStart.value), new Date(dateEnd.value));
        updateTable(tableSearchElem.value);
    }
}

function changeTabEvent(event) {
    let tabItem = event.target.closest(".tab__item");
    if (!tabItem) return;

    for (let i = 0; i < this.children.length; i++)
        this.children[i].classList.remove("tab__item_selected");

    tabItem.classList.add("tab__item_selected");

    let tabName = tabItem.innerHTML;
    let parts = this.parentElement.querySelectorAll(".wrapper");

    for (let i = 0; i < parts.length; i++) {
        if (~parts[i].className.toLowerCase().indexOf(tabName.toLowerCase()))
            parts[i].classList.remove("hidden");
        else
            parts[i].classList.add("hidden");
    }
}

function updateTableEvent(event) {
    if (event.key === "Enter") {
        event.target.blur();
        return;
    }

    updateTable(event.target.value);
}

function searchIntervalRateEvent(event) {
    updateChart(new Date(dateStart.value), new Date(dateEnd.value));
}

// SERVICE FUNCTIONS

function updateTable(searchText) {
    let rows = tableElem.querySelectorAll(".table__row");
    rows.forEach(row => {
        let cur = currencies.find(cur => cur.id === parseInt(row.dataset.id))
        if (!~row.dataset.id || (~row.firstChild.innerHTML.toLowerCase().indexOf(searchText.toLowerCase()) && cur.selected))
            row.classList.remove("hidden");
        else
            row.classList.add("hidden");
    })
}

function createTableRow(id, rowData, cellTag, isSelected = true, props = {}) {
    let tr = document.createElement("tr");
    if (!isSelected)
        tr.classList.add("hidden");
    tr.classList.add("table__row");
    tr.dataset.id = id;

    rowData.forEach((item, index) => {
        tr.appendChild(createElement(cellTag, item, formClassList(index, props)));
    })

    return tr;
}

function formClassList(index, props) {
    let classList = [];

    if (props.maxIndex === index)
        classList.push("table__row_max");

    if (props.minIndex === index)
        classList.push("table__row_min");

    return classList;
}

function createElement(cellTag, text, classList) {
    let td = document.createElement(cellTag);
    td.innerHTML = text;
    classList.forEach(classItem => td.classList.add(classItem));

    return td;
}

function updateCurrencies(currencies) {
    let currenciesSet = currencies.map(cur => createCurrencyElem(cur));

    currenciesContainerElem.innerHTML = currenciesSet.slice(0, currenciesCount).join("\n");
    currenciesPopupElem.innerHTML = currenciesSet.join("\n");
}

function createCurrencyElem(currency) {
    let prototype = `<div class="currency" data-id="{id}">
                        <input type="checkbox" {checked} class="currency__checkbox">
                        <p class="currency__text">{text}</p>
                    </div>`;
    return prototype.replace("{id}", currency.id)
        .replace("{checked}", currency.selected ? "checked" : "")
        .replace("{text}", currency.name);
}

async function updateChart(dateStart, dateEnd) {
    let date = dateController.getDateSet(dateStart, dateEnd);
    chart.updateLabels(date.labels);
    await Promise.all(currencies.map(async currency => {
        if (currency.selected) {
            let data = await exchanger.getRatePeriod(currency.id, date.start, date.end);
            if (chart.isDatasetExist(currency.code))
                chart.updateDataByName(currency.code, data);
            else
                chart.addDataSet(currency.code, data, generateColor());
        } else
            chart.removeByName(currency.code)
    }));
}

function isChartExist() {
    try {
        Chart;
        return true;
    } catch (e){
        return false
    }
}

function generateColor() {
    let red = Math.round(Math.random() * 255);
    let green = Math.round(Math.random() * 255);
    let blue = Math.round(Math.random() * 255);
    return `rgba(${red}, ${green}, ${blue}, 1)`;
}