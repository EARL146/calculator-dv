
const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");
const buttons = document.querySelector(".buttons");

let current = "0";
let stored = null;
let operator = null;
let waitingForNumber = false;
let finished = false;

function updateDisplay() {
    resultDisplay.textContent = current;
}

function clearAll() {
    current = "0";
    stored = null;
    operator = null;
    waitingForNumber = false;
    finished = false;
    expressionDisplay.textContent = "Ready to calculate";
    updateDisplay();
}

function inputNumber(value) {
    if (current === "Error") clearAll();

    if (finished) {
        current = value === "." ? "0." : value;
        finished = false;
        expressionDisplay.textContent = "";
    } else if (waitingForNumber) {
        current = value === "." ? "0." : value;
        waitingForNumber = false;
    } else if (value === ".") {
        if (!current.includes(".")) current += ".";
    } else if (current === "0") {
        current = value;
    } else if (current.replace("-", "").replace(".", "").length < 15) {
        current += value;
    }

    updateDisplay();
}

function formatNumber(number) {
    if (!Number.isFinite(number)) return "Error";

    const rounded = Number(number.toPrecision(12));
    return String(rounded);
}

function calculate(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
        default: return b;
    }
}

function chooseOperator(nextOperator) {
    if (current === "Error") return;

    const value = Number(current);

    if (operator && !waitingForNumber) {
        const answer = calculate(stored, value, operator);
        current = formatNumber(answer);
        updateDisplay();

        if (current === "Error") {
            expressionDisplay.textContent = "Invalid calculation";
            stored = null;
            operator = null;
            waitingForNumber = true;
            return;
        }

        stored = Number(current);
    } else {
        stored = value;
    }

    operator = nextOperator;
    waitingForNumber = true;
    finished = false;
    expressionDisplay.textContent = `${stored} ${operator}`;
}

function showResult() {
    if (!operator || stored === null || current === "Error") return;

    const a = stored;
    const b = Number(current);
    const op = operator;
    const answer = calculate(a, b, op);

    expressionDisplay.textContent = `${a} ${op} ${b} =`;
    current = formatNumber(answer);
    stored = null;
    operator = null;
    waitingForNumber = true;
    finished = true;
    updateDisplay();
}

function handleAction(action) {
    if (action === "clear") {
        clearAll();
        return;
    }

    if (action === "calculate") {
        showResult();
        return;
    }

    if (action === "delete") {
        if (current === "Error" || finished) {
            current = "0";
            finished = false;
        } else if (!waitingForNumber) {
            current = current.length > 1
                ? current.slice(0, -1)
                : "0";

            if (current === "-") current = "0";
        }

        updateDisplay();
        return;
    }

    if (action === "percent") {
        if (current !== "Error") {
            current = formatNumber(Number(current) / 100);
            updateDisplay();
        }
        return;
    }

    if (action === "sign") {
        if (current !== "Error" && current !== "0") {
            current = String(-Number(current));
            updateDisplay();
        }
    }
}

buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.value !== undefined) {
        const value = button.dataset.value;

        if (["+", "-", "*", "/"].includes(value)) {
            chooseOperator(value);
        } else {
            inputNumber(value);
        }
    } else {
        handleAction(button.dataset.action);
    }
});

document.addEventListener("keydown", (event) => {
    if (/^[0-9.]$/.test(event.key)) {
        inputNumber(event.key);
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        showResult();
    } else if (event.key === "Backspace") {
        handleAction("delete");
    } else if (event.key === "Escape") {
        clearAll();
    } else if (event.key === "%") {
        handleAction("percent");
    }
});
