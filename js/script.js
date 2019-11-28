// Калькулятор вкладов

// Первоначальный взнос
const sumText = document.querySelector('#sum-text'),
    sumRange = document.querySelector('#sum-range'),
    // Срок вклада
    dateText = document.querySelector('#date-text'),
    dateRange = document.querySelector('#date-range'),
    // Процент
    percent = document.querySelectorAll('.percent'),
    // Пополнение
    replenishment = document.querySelector('#replenishment'),
    // Периодичность пополнений
    paymentSpan = document.querySelector('.select-replenishment-time span'),
    paymentDay = document.querySelectorAll('.sub li'),
    // Капитализация
    capitalization = document.querySelector('#capitalization'),
    // Посчитать
    calculate = document.querySelector('#calculate');

//Форматировать поля
sumText.oninput = () => (formatSum.bind(sumText, true, sumRange, 0)());
dateText.oninput = () => (formatSum.bind(dateText, false, dateRange, 1)());
// Запрет на ввод суммы больше 100000
// Запрет на любые символы кроме цифр
// Запрет на ввод чего-либо кроме строк
function formatSum(sum, range, n) {
    let num = sum ? 100000 : 12;
    this.value = this.value > num ? num : this.value < 0 ? 0 : this.value;
    typeof(this.value) !== 'string' ? alert('Только строки'): this.value;
    this.value = this.value.replace(/[\D]/, '');
    // Полоска получит значение поля
    range.value = this.value;
    const color = colorizeRange.bind(range, n);
    color();
}

// Ползунки 
sumRange.oninput = () => (formatRange.bind(sumRange, sumText, 0)());
dateRange.oninput = () => (formatRange.bind(dateRange, dateText, 1)());
// Эффект при заполнении полоски
const plus = document.querySelectorAll('.plus');

//Текстовое поле примет значение ползунка
function formatRange(text, n) {
    text.value = this.value;
    const color = colorizeRange.bind(this, n);
    color();
};

// При увеличении значения, полоса окрашивается в другой цвет
function colorizeRange(n) { plus[n].style = `width: ${this.value / this.max * 100}%` };

// Проценты
let currentPercent;

function removeClass() {
    for (let i = 0; i < percent.length; i++) percent[i].classList.remove('percent-active');
}

percent.forEach((item, i, arr) => {
    item.onclick = () => {
        currentPercent = item.getAttribute('data-percent');
        removeClass();
        item.classList.add('percent-active');
    }
});

// Пополнение
replenishment.oninput = function() {
    typeof(this.value) !== 'string' ? alert('Только строки'): this.value;
    this.value = this.value.replace(/[\D]/, '');
};

// Периодичность пополнений
paymentSpan.onclick = () => document.querySelector('.sub').classList.toggle('hide');

const cancel = document.querySelector('#cancel');

let period;
paymentDay.forEach((item, i) => {
    item.onclick = () => {
        period = +item.getAttribute('data-days');
        paymentSpan.textContent = item.textContent;
        cancel.classList.remove('hide');
        document.querySelector('.sub').classList.toggle('hide');
    }
});

cancel.onclick = function() {
    period = false;
    paymentSpan.textContent = `Переодичность пополнения`;
    this.classList.add('hide');
}

// (new Date(year, month, day + d).getDate());


// Таблица в которую будет помещен результат
const resultTable = document.querySelector('.result table tbody');
const total = document.querySelector('.total p');

// Элементы для копирования
const template = document.querySelector('template').content;
tr = template.querySelector('tr');

// Отобразить ошибки
const errorBox = document.querySelector('.error-box'),
    error = template.querySelector('.error');

function showError(msg) {
    let clone = error.cloneNode();
    clone.innerHTML = `
    <p>${msg}</p>
    `;
    errorBox.append(clone);
    clone.classList.add('show-error');
    setTimeout(() => clone.remove(), 1500);
}

calculate.onclick = calculateDeposit;
document.onkeydown = e => {
        if (e.code === 'Enter') calculateDeposit();
    }
    // Собираем данные из полей и считаем
function calculateDeposit() {
    const deposit = {
        sum: +sumText.value,
        months: +dateText.value,
        days: +dateText.value * 30,
        percent: +currentPercent,
        plus: +replenishment.value,
        date: period,
        totalAdd: 0,
        total: +sumText.value,
        calc() {
            if (!this.sum) showError(`Введите сумму`);
            else if (!this.months) showError(`Не определен срок вклада`);
            else if (!this.percent) showError(`Выберите процент`);
            else {
                const setDate = (d) => {
                    // Если число меньше 10, приписать 0 перед ним
                    const formatDate = n => n < 10 ? `0${n}` : n;

                    // Текущая дата
                    let year = formatDate(new Date().getUTCFullYear()),
                        month = formatDate(new Date().getUTCMonth()),
                        day = formatDate(new Date().getUTCDate() + 1);

                    // К текущей дате добавляются дни выплат и получаем дату
                    let nY = formatDate(new Date(year, month, day + d).getUTCFullYear()),
                        nM = formatDate(new Date(year, month, day + d).getUTCMonth() + 1),
                        nD = formatDate(new Date(year, month, day + d).getUTCDate());

                    return `${nD}.${nM}.${nY}`;
                }

                // Посчитать процент
                const calcPercent = n => (this.sum * this.percent * 30 / 365 / 100).toFixed(2);

                function showResult(capitalization) {
                    // Перед выводом удалить предыдущий результат
                    while (resultTable.children[1]) resultTable.children[1].remove();
                    // Вывести результат
                    for (let i = 1; i <= this.months; i++) {
                        let ctr = tr.cloneNode(true);
                        let td = ctr.querySelectorAll('td');
                        td[0].textContent = setDate(i * 30);
                        td[1].textContent = calcPercent();
                        // Если выбрана переодичность пополнений
                        if (this.date && i % this.date === 0) {
                            this.sum += this.plus;
                            this.totalAdd += this.plus; // Общая сумма пополнений за весь срок
                            td[2].textContent = this.plus;
                            // Без капитализаци будет выходить процент из пер.суммы + пополнение
                            if (!capitalization) {
                                this.total += this.plus + +calcPercent();
                                td[3].textContent = (this.total).toFixed(2);
                                // С капитализацией будет выходить процент из суммы процента и суммы вклада
                            } else {
                                td[1].textContent = calcPercent();
                                this.sum += +calcPercent();
                                this.total = this.sum;
                                td[3].textContent = (this.sum).toFixed(2);
                                // td[3].textContent = (this.total).toFixed(2);
                            }
                        } else {
                            td[2].textContent = 0;
                            if (!capitalization) {
                                this.total += +calcPercent();
                                td[3].textContent = (this.total).toFixed(2);
                            } else {
                                this.sum += +calcPercent();
                                this.total = this.sum;
                                td[3].textContent = (this.total).toFixed(2);
                                // this.total = this.sum += +calcPercent();
                                // td[3].textContent = (this.total).toFixed(2);
                            }
                        }
                        total.innerHTML = `
                    ${setDate(0)} - ${setDate(this.days)} 
                    <br> Пополнения: ${this.totalAdd} рублей. 
                    <br> За <b>${this.months}</b> месяцев Вы сможете накопить 
                    <b>${(this.total).toFixed(2)}</b> руб.`;

                        resultTable.append(ctr);
                    }
                }

                (showResult.bind(this, capitalization.checked))();

                // Если экран больше 900 пикселей применить эту анимацию
                document.querySelector('.calculator').classList.add('rotate-180');
                document.querySelector('.result').classList.add('rotate-360');

                const rotateBack = document.querySelector('.rotate-back');
                // rotateBack.style = `display: initial;`;
                rotateBack.onclick = function() {
                    document.querySelector('.calculator').classList.remove('rotate-180');
                    document.querySelector('.result').classList.remove('rotate-360');
                }
            }
        }
    }
    deposit.calc();
}