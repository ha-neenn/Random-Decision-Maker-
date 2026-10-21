const $ = (id) => document.getElementById(id);

const wheel = $("wheel");
const ctx = wheel.getContext("2d");

const input = $("choiceInput");
const list = $("choicesList");
const labels = $("wheelLabels");
const count = $("choiceCount");

const spinButton = $("spinButton");
const resetButton = $("resetButton");
const languageButton = $("languageButton");

const result = $("result");
const message = $("message");

const TAU = Math.PI * 2;

const colors = [
  "#DCEBE2",
  "#E8E0F0",
  "#F3DFD7",
  "#E7E8D5",
  "#C8DAD8",
  "#F0E7D8",
];

let language = "en";
let choices = [];
let rotation = 0;
let isSpinning = false;

const translations = {
  en: {
    pageTitle: "Random Decision Maker",
    eyebrow: "A LITTLE HELP DECIDING",
    subtitle: "Can't decide? Let the wheel choose for you!",
    choicesTitle: "Your choices",
    choicesSubtitle: "Add your options and let fate decide.",
    placeholder: "Enter a choice...",
    inputLabel: "Enter a choice",
    addLabel: "Add choice",
    spin: "Spin the wheel",
    clear: "Clear all",
    count: (n) => `${n} ${n === 1 ? "choice" : "choices"}`,
    empty: "Your list is empty. Add a choice above.",
    initialResult: "Your result will appear here",
    ready: "Ready when you are!",
    spinning: "The wheel is spinning...",
    winner: (name) => `The wheel chose: ${name}`,
    emptyInput: "Please enter a choice first.",
    duplicate: "This choice is already on your list.",
    noChoices: "Add at least one choice before spinning.",
    remove: (name) => `Remove ${name}`,
    clearConfirm: "Remove all choices?",
    footerNote: "Make room for a little surprise.",
    footer: "Made for the little decisions in life",
    languageButton: "العربية",
    wheelLabel: "Wheel of choices",
  },

  ar: {
    pageTitle: "صانع القرارات العشوائية",
    eyebrow: "خلّي الاختيار علينا",
    subtitle: "محتار؟ سيب عجلة الحظ تختار لك!",
    choicesTitle: "اختياراتك",
    choicesSubtitle: "اكتب اختياراتك وسيب الباقي علينا.",
    placeholder: "اكتب اختيارك هنا...",
    inputLabel: "اكتب اختيارك",
    addLabel: "إضافة اختيار",
    spin: "لف العجلة",
    clear: "مسح الكل",
    count: (n) => `${n} ${n === 1 ? "اختيار" : "اختيارات"}`,
    empty: "القائمة فاضية. أضف اختيارًا جديدًا.",
    initialResult: "النتيجة هتظهر هنا",
    ready: "جاهزين؟ يلا بينا!",
    spinning: "العجلة بتلف...",
    winner: (name) => `العجلة اختارت: ${name}`,
    emptyInput: "اكتب اختيارك الأول.",
    duplicate: "الاختيار ده موجود بالفعل.",
    noChoices: "ضيف اختيار واحد على الأقل الأول.",
    remove: (name) => `حذف ${name}`,
    clearConfirm: "هل تريد مسح كل الاختيارات؟",
    footerNote: "خلي القرار مفاجأة لطيفة!",
    footer: "قرارات صغيرة، مفاجآت جميلة",
    languageButton: "English",
    wheelLabel: "عجلة الاختيارات",
  },
};

function t(key, value) {
  const text = translations[language][key];

  return typeof text === "function" ? text(value) : text;
}

function updateLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.title = t("pageTitle");

  $("eyebrow").textContent = t("eyebrow");
  $("title").textContent = t("pageTitle");
  $("subtitle").textContent = t("subtitle");
  $("choicesTitle").textContent = t("choicesTitle");
  $("choicesSubtitle").textContent = t("choicesSubtitle");
  $("footerNote").textContent = t("footerNote");
  $("footerText").textContent = t("footer");

  input.placeholder = t("placeholder");
  input.setAttribute("aria-label", t("inputLabel"));

  $("addButton").setAttribute("aria-label", t("addLabel"));
  wheel.setAttribute("aria-label", t("wheelLabel"));

  spinButton.textContent = t("spin");
  resetButton.textContent = t("clear");
  languageButton.textContent = t("languageButton");

  renderChoices();
}

function drawWheel() {
  const center = wheel.width / 2;
  const radius = center - 10;

  ctx.clearRect(0, 0, wheel.width, wheel.height);

  if (choices.length === 0) {
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, TAU);
    ctx.fillStyle = "#F1EEE7";
    ctx.fill();
    ctx.strokeStyle = "#E4DED3";
    ctx.lineWidth = 4;
    ctx.stroke();
    return;
  }

  const slice = TAU / choices.length;

  for (let i = 0; i < choices.length; i++) {
    const start = rotation + i * slice - Math.PI / 2;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();

    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.strokeStyle = "#FFFDF9";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(center, center, 18, 0, TAU);
  ctx.fillStyle = "#FFFDF9";
  ctx.fill();
  ctx.strokeStyle = "#D9E5DC";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function updateWheelLabels() {
  labels.replaceChildren();

  if (choices.length === 0) {
    return;
  }

  const slice = TAU / choices.length;

  for (let i = 0; i < choices.length; i++) {
    const angle = rotation + (i + 0.5) * slice - Math.PI / 2;
    const label = document.createElement("span");

    label.className = "wheel-label";
    label.textContent = choices[i];
    label.style.left = 50 + Math.cos(angle) * 31 + "%";
    label.style.top = 50 + Math.sin(angle) * 31 + "%";
    label.dir = "auto";
    label.title = choices[i];

    labels.appendChild(label);
  }
}

function renderChoices() {
  list.replaceChildren();
  count.textContent = t("count", choices.length);

  spinButton.disabled = isSpinning || choices.length === 0;
  resetButton.disabled = isSpinning || choices.length === 0;

  if (choices.length === 0) {
    const item = document.createElement("li");

    item.className = "empty-state";
    item.textContent = t("empty");
    list.appendChild(item);
  }

  for (let i = 0; i < choices.length; i++) {
    const item = document.createElement("li");
    const name = document.createElement("span");
    const removeButton = document.createElement("button");

    item.className = "choice-item";

    name.className = "choice-name";
    name.textContent = choices[i];
    name.dir = "auto";

    removeButton.className = "remove-button";
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", t("remove", choices[i]));

    removeButton.addEventListener("click", function () {
      if (isSpinning) {
        return;
      }

      choices.splice(i, 1);
      result.textContent = t("initialResult");
      message.textContent = "";

      renderChoices();
    });

    item.appendChild(name);
    item.appendChild(removeButton);
    list.appendChild(item);
  }

  drawWheel();
  updateWheelLabels();
}

$("choiceForm").addEventListener("submit", function (event) {
  event.preventDefault();

  if (isSpinning) {
    return;
  }

  const choice = input.value.trim();

  if (choice === "") {
    message.textContent = t("emptyInput");
    input.focus();
    return;
  }

  for (let i = 0; i < choices.length; i++) {
    if (choices[i].toLowerCase() === choice.toLowerCase()) {
      message.textContent = t("duplicate");
      input.focus();
      return;
    }
  }

  choices.push(choice);

  input.value = "";
  message.textContent = "";
  result.textContent = t("ready");

  renderChoices();
  input.focus();
});

function spinWheel() {
  if (isSpinning) {
    return;
  }

  if (choices.length === 0) {
    message.textContent = t("noChoices");
    return;
  }

  isSpinning = true;
  message.textContent = "";
  result.textContent = t("spinning");

  renderChoices();

  const winnerIndex = Math.floor(Math.random() * choices.length);
  const winner = choices[winnerIndex];
  const slice = TAU / choices.length;

  const targetAngle = -(winnerIndex + 0.5) * slice;
  const extraTurn = (targetAngle - (rotation % TAU) + TAU * 2) % TAU;

  const start = rotation;
  const end = rotation + 6 * TAU + extraTurn;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / 4200, 1);
    const speed = 1 - Math.pow(1 - progress, 4);

    rotation = start + (end - start) * speed;

    drawWheel();
    updateWheelLabels();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      rotation = end % TAU;
      isSpinning = false;

      renderChoices();
      result.textContent = t("winner", winner);
    }
  }

  requestAnimationFrame(animate);
}

spinButton.addEventListener("click", spinWheel);

resetButton.addEventListener("click", function () {
  if (isSpinning || choices.length === 0) {
    return;
  }

  if (!confirm(t("clearConfirm"))) {
    return;
  }

  choices = [];
  rotation = 0;

  result.textContent = t("initialResult");
  message.textContent = "";

  renderChoices();
});

languageButton.addEventListener("click", function () {
  language = language === "en" ? "ar" : "en";
  message.textContent = "";

  updateLanguage();
});

updateLanguage();
