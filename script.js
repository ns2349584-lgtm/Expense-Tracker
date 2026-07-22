const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

if (!currentUser) {
    window.location.href = "login.html";
}


let transactions = [];
let filteredTransactions = [];

let currentTheme =
    localStorage.getItem(`theme_${currentUser.id}`) || "light";

let currentCurrency =
    localStorage.getItem(`currency_${currentUser.id}`) || "USD";

let exchangeRates = {};


const baseExchangeRates = {

    USD: 1.00,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
    JPY: 149.50,
    AUD: 1.52,
    CAD: 1.36,
    CHF: 0.88,
    CNY: 7.24,
    SEK: 10.65,
    NZD: 1.65,
    MXN: 17.05,
    SGD: 1.35,
    HKD: 7.85,
    NOK: 10.50,
    KRW: 1319.50,
    BRL: 4.97,
    ZAR: 18.65

};


const currencySymbols = {

    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "₣",
    CNY: "¥",
    SEK: "kr",
    NZD: "NZ$",
    MXN: "₱",
    SGD: "S$",
    HKD: "HK$",
    NOK: "kr",
    KRW: "₩",
    BRL: "R$",
    ZAR: "R"

};


const currencyLocales = {

    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    INR: "en-IN",
    JPY: "ja-JP",
    AUD: "en-AU",
    CAD: "en-CA",
    CHF: "de-CH",
    CNY: "zh-CN",
    SEK: "sv-SE",
    NZD: "en-NZ",
    MXN: "es-MX",
    SGD: "en-SG",
    HKD: "zh-HK",
    NOK: "nb-NO",
    KRW: "ko-KR",
    BRL: "pt-BR",
    ZAR: "en-ZA"

};


const currencySelect =
    document.getElementById("currencySelect");

const exchangeRateInfo =
    document.getElementById("exchangeRateInfo");

const transactionForm =
    document.getElementById("transactionForm");

const titleInput =
    document.getElementById("title");

const amountInput =
    document.getElementById("amount");

const typeInput =
    document.getElementById("type");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("date");

const transactionsList =
    document.getElementById("transactionsList");

const recentTransactions =
    document.getElementById("recentTransactions");

const expenseSummary =
    document.getElementById("expenseSummary");

const totalBalanceEl =
    document.getElementById("totalBalance");

const totalIncomeEl =
    document.getElementById("totalIncome");

const totalExpensesEl =
    document.getElementById("totalExpenses");

const transactionCountEl =
    document.getElementById("transactionCount");

const filteredCountEl =
    document.getElementById("filteredCount");

const searchInput =
    document.getElementById("searchInput");

const filterTypeSelect =
    document.getElementById("filterType");

const filterCategorySelect =
    document.getElementById("filterCategory");

const sortOption =
    document.getElementById("sortOption");

const clearAllBtn =
    document.getElementById("clearAllBtn");

const themeToggle =
    document.getElementById("themeToggle");

const userName =
    document.getElementById("userName");

const logoutBtn =
    document.getElementById("logoutBtn");


function initializeApp() {

    exchangeRates = {
        ...baseExchangeRates
    };


    currencySelect.value = currentCurrency;


    userName.textContent =
        currentUser.name || "User";


    setTheme(currentTheme);


    loadFromLocalStorage();


    setDefaultDate();


    updateDashboard();


    applyFiltersAndSort();


    updateExpenseSummary();


    updateRecentTransactions();


    attachEventListeners();

}


function attachEventListeners() {

    transactionForm.addEventListener(
        "submit",
        addTransaction
    );


    searchInput.addEventListener(
        "input",
        applyFiltersAndSort
    );


    filterTypeSelect.addEventListener(
        "change",
        applyFiltersAndSort
    );


    filterCategorySelect.addEventListener(
        "change",
        applyFiltersAndSort
    );


    sortOption.addEventListener(
        "change",
        applyFiltersAndSort
    );


    clearAllBtn.addEventListener(
        "click",
        clearAllTransactions
    );


    themeToggle.addEventListener(
        "click",
        toggleTheme
    );


    currencySelect.addEventListener(
        "change",
        changeCurrency
    );


    logoutBtn.addEventListener(
        "click",
        logout
    );

}


function addTransaction(event) {

    event.preventDefault();


    clearErrors();


    if (!validateForm()) {
        return;
    }


    const transaction = {

        id: Date.now(),

        title:
            titleInput.value.trim(),

        amount:
            parseFloat(
                amountInput.value
            ),

        type:
            typeInput.value,

        category:
            categoryInput.value,

        date:
            dateInput.value,

        currency:
            currentCurrency,

        createdAt:
            new Date().toISOString()

    };


    transactions.push(
        transaction
    );


    saveToLocalStorage();


    transactionForm.reset();


    setDefaultDate();


    updateDashboard();


    applyFiltersAndSort();


    updateExpenseSummary();


    updateRecentTransactions();


    showSuccessMessage(
        "Transaction added successfully!"
    );

}


function deleteTransaction(id) {

    const shouldDelete =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!shouldDelete) {
        return;
    }


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveToLocalStorage();


    updateDashboard();


    applyFiltersAndSort();


    updateExpenseSummary();


    updateRecentTransactions();

}


function clearAllTransactions() {

    if (transactions.length === 0) {

        alert(
            "There are no transactions to clear."
        );

        return;

    }


    const shouldClear =
        confirm(
            "Are you sure you want to delete ALL transactions? This cannot be undone."
        );


    if (!shouldClear) {
        return;
    }


    transactions = [];


    filteredTransactions = [];


    saveToLocalStorage();


    updateDashboard();


    renderTransactions([]);


    updateExpenseSummary();


    updateRecentTransactions();


    showSuccessMessage(
        "All transactions cleared!"
    );

}


function updateDashboard() {

    const totals =
        calculateTotals();


    totalBalanceEl.textContent =
        formatCurrency(
            totals.balance
        );


    totalIncomeEl.textContent =
        formatCurrency(
            totals.income
        );


    totalExpensesEl.textContent =
        formatCurrency(
            totals.expenses
        );


    transactionCountEl.textContent =
        transactions.length;

}


function calculateTotals() {

    return transactions.reduce(

        (totals, transaction) => {

            const transactionCurrency =
                transaction.currency ||
                "USD";


            const convertedAmount =
                convertCurrency(
                    transaction.amount,
                    transactionCurrency,
                    currentCurrency
                );


            if (
                transaction.type ===
                "income"
            ) {

                totals.income +=
                    convertedAmount;

                totals.balance +=
                    convertedAmount;

            } else if (
                transaction.type ===
                "expense"
            ) {

                totals.expenses +=
                    convertedAmount;

                totals.balance -=
                    convertedAmount;

            }


            return totals;

        },

        {
            balance: 0,
            income: 0,
            expenses: 0
        }

    );

}


function changeCurrency() {

    currentCurrency =
        currencySelect.value;


    localStorage.setItem(

        `currency_${currentUser.id}`,

        currentCurrency

    );


    updateDashboard();


    applyFiltersAndSort();


    updateExpenseSummary();


    updateRecentTransactions();

}


function convertCurrency(
    amount,
    fromCurrency,
    toCurrency
) {

    if (
        fromCurrency ===
        toCurrency
    ) {

        return amount;

    }


    const fromRate =
        exchangeRates[fromCurrency];

    const toRate =
        exchangeRates[toCurrency];


    if (
        !fromRate ||
        !toRate
    ) {

        return amount;

    }


    const amountInUSD =
        amount / fromRate;


    const convertedAmount =
        amountInUSD * toRate;


    return convertedAmount;

}


function formatCurrency(
    amount,
    currency = currentCurrency
) {

    try {

        return new Intl.NumberFormat(

            currencyLocales[currency] ||
                "en-US",

            {

                style: "currency",

                currency: currency,

                minimumFractionDigits:
                    currency === "JPY" ||
                    currency === "KRW"
                        ? 0
                        : 2,

                maximumFractionDigits:
                    currency === "JPY" ||
                    currency === "KRW"
                        ? 0
                        : 2

            }

        ).format(amount);

    } catch (error) {

        return (

            currencySymbols[currency] ||
            "$"

        ) + amount.toFixed(2);

    }

}


function renderTransactions(
    transactionsToRender
) {

    filteredTransactions =
        [...transactionsToRender];


    filteredCountEl.textContent =

        `(${transactionsToRender.length} transaction${transactionsToRender.length !== 1 ? "s" : ""})`;


    transactionsList.innerHTML =
        "";


    if (
        transactionsToRender.length ===
        0
    ) {

        transactionsList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📭
                </div>

                <p>
                    No transactions found.
                </p>

            </div>

        `;

        return;

    }


    transactionsToRender.forEach(
        transaction => {

            const transactionCard =
                createTransactionCard(
                    transaction
                );


            transactionsList.appendChild(
                transactionCard
            );

        }
    );

}


function createTransactionCard(
    transaction
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        `transaction-card ${transaction.type}`;


    const transactionCurrency =
        transaction.currency ||
        "USD";


    const convertedAmount =
        convertCurrency(

            transaction.amount,

            transactionCurrency,

            currentCurrency

        );


    const formattedAmount =
        formatCurrency(
            convertedAmount
        );


    const sign =
        transaction.type ===
        "income"
            ? "+"
            : "-";


    const categoryEmoji =
        getCategoryEmoji(
            transaction.category
        );


    card.innerHTML = `

        <div class="transaction-info">

            <div class="transaction-title">

                <span>
                    ${categoryEmoji}
                </span>

                <span>
                    ${escapeHTML(
                        transaction.title
                    )}
                </span>

            </div>


            <div class="transaction-category">

                ${escapeHTML(
                    transaction.category
                )}

            </div>


            <div class="transaction-date">

                ${formatDate(
                    transaction.date
                )}

            </div>

        </div>


        <div
            class="transaction-amount ${transaction.type}"
        >

            ${sign}${formattedAmount}

        </div>


        <div class="transaction-actions">

            <button
                class="btn-icon"
                type="button"
                data-id="${transaction.id}"
                title="Delete transaction"
            >
                🗑️
            </button>

        </div>

    `;


    const deleteButton =
        card.querySelector(
            ".btn-icon"
        );


    deleteButton.addEventListener(
        "click",
        () => {
            deleteTransaction(
                transaction.id
            );
        }
    );


    return card;

}


function updateExpenseSummary() {

    const expensesByCategory = {};

    let totalExpenses = 0;


    transactions.forEach(
        transaction => {

            if (
                transaction.type !==
                "expense"
            ) {

                return;

            }


            const transactionCurrency =
                transaction.currency ||
                "USD";


            const amount =
                convertCurrency(

                    transaction.amount,

                    transactionCurrency,

                    currentCurrency

                );


            if (
                !expensesByCategory[
                    transaction.category
                ]
            ) {

                expensesByCategory[
                    transaction.category
                ] = 0;

            }


            expensesByCategory[
                transaction.category
            ] += amount;


            totalExpenses +=
                amount;

        }
    );


    expenseSummary.innerHTML =
        "";


    if (
        totalExpenses === 0
    ) {

        expenseSummary.innerHTML =

            `<p class="empty-message">
                No expenses to display
            </p>`;

        return;

    }


    const sortedCategories =
        Object.entries(
            expensesByCategory
        ).sort(
            (a, b) =>
                b[1] - a[1]
        );


    sortedCategories.forEach(
        ([category, amount]) => {

            const percentage =

                (
                    amount /
                    totalExpenses
                ) * 100;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "expense-item";


            item.innerHTML = `

                <div>

                    <span class="expense-item-name">

                        ${getCategoryEmoji(
                            category
                        )}

                        ${escapeHTML(
                            category
                        )}

                    </span>


                    <div class="expense-bar">

                        <div
                            class="expense-bar-fill"
                            style="width: ${percentage}%"
                        ></div>

                    </div>

                </div>


                <span class="expense-item-amount">

                    ${formatCurrency(
                        amount
                    )}

                </span>

            `;


            expenseSummary.appendChild(
                item
            );

        }
    );

}


function updateRecentTransactions() {

    recentTransactions.innerHTML =
        "";


    const recent =
        [...transactions]

            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.date
                        );

                    const dateB =
                        new Date(
                            b.date
                        );


                    if (
                        dateB - dateA !==
                        0
                    ) {

                        return (
                            dateB - dateA
                        );

                    }


                    return (
                        new Date(
                            b.createdAt ||
                            0
                        ) -

                        new Date(
                            a.createdAt ||
                            0
                        )
                    );

                }
            )

            .slice(
                0,
                5
            );


    if (
        recent.length === 0
    ) {

        recentTransactions.innerHTML = `

            <div class="empty-state">

                <p>
                    No recent transactions
                </p>

            </div>

        `;

        return;

    }


    recent.forEach(
        transaction => {

            recentTransactions.appendChild(

                createTransactionCard(
                    transaction
                )

            );

        }
    );

}


function applyFiltersAndSort() {

    let filtered =
        [...transactions];


    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    if (searchTerm) {

        filtered =
            filtered.filter(
                transaction => {

                    const title =
                        (
                            transaction.title ||
                            ""
                        )
                            .toLowerCase();


                    const category =
                        (
                            transaction.category ||
                            ""
                        )
                            .toLowerCase();


                    return (

                        title.includes(
                            searchTerm
                        ) ||

                        category.includes(
                            searchTerm
                        )

                    );

                }
            );

    }


    const typeFilter =
        filterTypeSelect.value;


    if (
        typeFilter !==
        "all"
    ) {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.type ===
                    typeFilter
            );

    }


    const categoryFilter =
        filterCategorySelect.value;


    if (
        categoryFilter !==
        "all"
    ) {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.category ===
                    categoryFilter
            );

    }


    filtered =
        applySort(
            filtered
        );


    renderTransactions(
        filtered
    );

}


function applySort(
    transactionsToSort
) {

    const sorted =
        [...transactionsToSort];


    const sortType =
        sortOption.value;


    switch (sortType) {

        case "newest":

            return sorted.sort(
                (a, b) => {

                    const dateDifference =

                        new Date(
                            b.date
                        ) -

                        new Date(
                            a.date
                        );


                    if (
                        dateDifference !==
                        0
                    ) {

                        return dateDifference;

                    }


                    return (

                        new Date(
                            b.createdAt ||
                            0
                        ) -

                        new Date(
                            a.createdAt ||
                            0
                        )

                    );

                }
            );


        case "oldest":

            return sorted.sort(
                (a, b) => {

                    const dateDifference =

                        new Date(
                            a.date
                        ) -

                        new Date(
                            b.date
                        );


                    if (
                        dateDifference !==
                        0
                    ) {

                        return dateDifference;

                    }


                    return (

                        new Date(
                            a.createdAt ||
                            0
                        ) -

                        new Date(
                            b.createdAt ||
                            0
                        )

                    );

                }
            );


        case "highest":

            return sorted.sort(
                (a, b) => {

                    const amountA =
                        convertCurrency(

                            a.amount,

                            a.currency ||
                                "USD",

                            currentCurrency

                        );


                    const amountB =
                        convertCurrency(

                            b.amount,

                            b.currency ||
                                "USD",

                            currentCurrency

                        );


                    return (
                        amountB -
                        amountA
                    );

                }
            );


        case "lowest":

            return sorted.sort(
                (a, b) => {

                    const amountA =
                        convertCurrency(

                            a.amount,

                            a.currency ||
                                "USD",

                            currentCurrency

                        );


                    const amountB =
                        convertCurrency(

                            b.amount,

                            b.currency ||
                                "USD",

                            currentCurrency

                        );


                    return (
                        amountA -
                        amountB
                    );

                }
            );


        default:

            return sorted;

    }

}


function saveToLocalStorage() {

    localStorage.setItem(

        `transactions_${currentUser.id}`,

        JSON.stringify(
            transactions
        )

    );

}


function loadFromLocalStorage() {

    const stored =
        localStorage.getItem(

            `transactions_${currentUser.id}`

        );


    if (!stored) {

        transactions = [];

        return;

    }


    try {

        const parsedData =
            JSON.parse(
                stored
            );


        if (
            Array.isArray(
                parsedData
            )
        ) {

            transactions =
                parsedData;

        } else {

            transactions = [];

        }

    } catch (error) {

        console.error(
            "Unable to load transactions:",
            error
        );


        transactions = [];

    }

}


function toggleTheme() {

    currentTheme =

        currentTheme ===
        "light"

            ? "dark"

            : "light";


    setTheme(
        currentTheme
    );


    localStorage.setItem(

        `theme_${currentUser.id}`,

        currentTheme

    );

}


function setTheme(
    theme
) {

    document.documentElement
        .setAttribute(
            "data-theme",
            theme
        );


    const icon =
        themeToggle.querySelector(
            ".theme-icon"
        );


    if (icon) {

        icon.textContent =

            theme === "dark"
                ? "☀️"
                : "🌙";

    }

}


function validateForm() {

    let isValid = true;


    const title =
        titleInput.value.trim();


    const amount =
        parseFloat(
            amountInput.value
        );


    if (!title) {

        showError(

            "titleError",

            "Please enter a transaction title"

        );


        isValid = false;

    }


    if (
        !amountInput.value ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showError(

            "amountError",

            "Please enter a valid amount greater than 0"

        );


        isValid = false;

    }


    if (!typeInput.value) {

        showError(

            "typeError",

            "Please select a transaction type"

        );


        isValid = false;

    }


    if (!categoryInput.value) {

        showError(

            "categoryError",

            "Please select a category"

        );


        isValid = false;

    }


    if (!dateInput.value) {

        showError(

            "dateError",

            "Please select a date"

        );


        isValid = false;

    }


    return isValid;

}


function showError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            message;

        element.classList.add(
            "show"
        );

    }

}


function clearErrors() {

    document
        .querySelectorAll(
            ".error-message"
        )
        .forEach(
            element => {

                element.textContent =
                    "";

                element.classList.remove(
                    "show"
                );

            }
        );

}


function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Invalid date";

    }


    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    ).format(
        date
    );

}


function getCategoryEmoji(
    category
) {

    const emojiMap = {

        food: "🍔",

        travel: "✈️",

        shopping: "🛍️",

        education: "📚",

        bills: "💡",

        entertainment: "🎬",

        health: "🏥",

        salary: "💼",

        bonus: "🎁",

        investment: "📈",

        other: "📌"

    };


    return (

        emojiMap[
            category
        ] ||

        "📌"

    );

}


function setDefaultDate() {

    const today =

        new Date()
            .toISOString()
            .split("T")[0];


    dateInput.value =
        today;

}


function showSuccessMessage(
    message
) {

    console.log(
        "✅ " + message
    );

}


function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


function logout() {

    const shouldLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!shouldLogout) {
        return;
    }


    localStorage.removeItem(
        "currentUser"
    );


    window.location.href =
        "login.html";

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(

        "DOMContentLoaded",

        initializeApp

    );

} else {

    initializeApp();

}