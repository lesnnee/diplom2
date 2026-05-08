import fs from "fs";

const categories = {
  network: [
    "Wi-Fi работает нестабильно",
    "не подключается VPN",
    "очень медленный интернет",
    "падает соединение с сетью",
    "нет доступа к внутренним ресурсам",
    "DNS не резолвит адреса",
    "обрывается соединение",
    "не работает корпоративная сеть",
  ],

  software: [
    "приложение вылетает при запуске",
    "ошибка авторизации в системе",
    "не открывается корпоративная система",
    "ошибка при обновлении программы",
    "система зависает при работе",
    "не работает экспорт отчёта",
    "не запускается приложение",
    "ошибка лицензии",
  ],

  hardware: [
    "ноутбук перегревается",
    "не работает клавиатура",
    "монитор не включается",
    "жёсткий диск издаёт шум",
    "не работает USB порт",
    "быстро разряжается батарея",
    "мышь не реагирует",
    "компьютер не включается",
  ],

  security: [
    "подозрительный вход в систему",
    "антивирус блокирует файлы",
    "учётная запись заблокирована",
    "фишинговое письмо получено",
    "подозрительная активность в аккаунте",
    "попытка взлома аккаунта",
    "фаервол блокирует доступ",
    "возможна утечка данных",
  ],

  infrastructure: [
    "сервер недоступен",
    "ошибка базы данных",
    "облачный сервис не работает",
    "сбой резервного копирования",
    "балансировщик нагрузки упал",
    "заканчивается место на сервере",
    "кластер недоступен",
    "инфраструктура перегружена",
  ],
};

// ========== ВАРИАНТ 1: КРОСС-КАТЕГОРИЙНЫЕ ПРОБЛЕМЫ ==========
const crossIssues = [
  { text: "из-за вируса не работает Wi-Fi", categories: ["security", "network"] },
  { text: "сервер упал, приложение не открывается", categories: ["infrastructure", "software"] },
  { text: "после обновления ОС перестала работать клавиатура", categories: ["software", "hardware"] },
  { text: "антивирус заблокировал корпоративный софт", categories: ["security", "software"] },
  { text: "сбой БД из-за хакерской атаки", categories: ["infrastructure", "security"] },
  { text: "ноутбук перегревается и вылетает приложение", categories: ["hardware", "software"] },
  { text: "фаервол режет VPN соединение", categories: ["security", "network"] },
  { text: "закончилось место на сервере и не грузится CRM", categories: ["infrastructure", "software"] },
  { text: "ддос атака положила кластер баз данных", categories: ["security", "infrastructure"] },
  { text: "после установки обновления перестал работать USB", categories: ["software", "hardware"] },
];

// ========== ВАРИАНТ 2: ШУМ И НЕЙТРАЛЬНЫЕ ОБРАЩЕНИЯ ==========
const noiseQueries = [
  { text: "как поменять пароль?", category: "security" },
  { text: "где найти документ?", category: null }, // нейтральный
  { text: "хочу новый монитор", category: "hardware" },
  { text: "сколько стоит ноутбук?", category: "hardware" },
  { text: "когда выдадут новую клавиатуру?", category: "hardware" },
  { text: "как подключить принтер?", category: "hardware" },
  { text: "где скачать программу?", category: "software" },
  { text: "как настроить почту?", category: "network" },
  { text: "что делать если забыл логин?", category: "security" },
  { text: "проведите инструктаж по безопасности", category: "security" },
  { text: "как увеличить скорость интернета?", category: "network" },
  { text: "когда починят сервер?", category: "infrastructure" },
  { text: "сделайте бэкап моих файлов", category: "infrastructure" },
];

// ========== ВАРИАНТ 3: РАЗМЫТЫЕ ГРАНИЦЫ ==========
const ambiguousIssues = [
  { text: "компьютор тупит", possibleCategories: ["hardware", "software"] },
  { text: "инет не робит но днс работает", possibleCategories: ["network", "infrastructure"] },
  { text: "антивирус сожрал все ресурсы сервера", possibleCategories: ["security", "infrastructure"] },
  { text: "всё зависло и ничего не работает", possibleCategories: ["hardware", "software", "network"] },
  { text: "какая-то фигня с компьютером", possibleCategories: ["hardware", "software"] },
  { text: "система медленно работает", possibleCategories: ["software", "infrastructure"] },
  { text: "не могу зайти никуда", possibleCategories: ["network", "security", "software"] },
  { text: "постоянно ошибка какая-то", possibleCategories: ["software", "infrastructure"] },
  { text: "всё поломалось после обновления", possibleCategories: ["software", "hardware"] },
  { text: "интернет есть а сайты не открываются", possibleCategories: ["network", "security"] },
];

// ========== ВАРИАНТ 4: REAL USER-STYLE СООБЩЕНИЯ ==========
const realUserComplaints = {
  network: [
    "всё виснет уже час, ютуб не грузит, помогите!!!",
    "котики в дискорде не открываются, вайфай горит огнём 🤬",
    "сервак наш умер, все домой идём? или как?",
    "инет как черепаха, даже почта не открывается 😭",
    "вайфай есть а интернета нет, чё за нафиг?",
    "днс не резолвится, site not found error",
    "пнг 500 стабильно, весь офис стоит",
  ],
  software: [
    "программа крашнулась с ошибкой 0х00005, чё делать?",
    "эксель не сохраняет файл, бесит просто ппц",
    "1С тупит и не открывает базу, мы не работаем уже час",
    "короче, апдейт убил всю систему, откатите плиз",
    "приложение вылетает на старте, переустановка не помогла",
    "нет лицензии? но мы же купили! проверьте срочно",
    "база данных не отвечает, sql error 4060",
  ],
  hardware: [
    "ноут греется как утюг, яичницу жарить можно 🔥",
    "клава не печатает букву 'о', бесит просто ппц, как работать?",
    "комп не включается нафиг почините срочно!",
    "мышь дёргается и клацает сама по себе, это венда? или вирус?",
    "экран моргает и полоски какие-то, хз чё случилось",
    "usb порты сдохли все, мышку не подключить(((",
    "батарея живёт час максимум, ноут отключается резко",
  ],
  security: [
    "взломали аккаунт? пришло письмо со сменой пароля, я не менял!!!",
    "антивирус орет что троян, но это наш софт, добавьте в исключения",
    "какая-то хуйня, все файлы .encrypted стали, это вирус?",
    "фаервол блокирует всё подряд, даже интернет не работает",
    "учётку заблокировали за подозрительную активность, разблокируйте пж",
    "фишинг пришёл якобы от директора, все нажали уже))) чё делать?",
    "подозрительный вход из турции, это не я!!",
  ],
  infrastructure: [
    "сервер лежит, база не коннектится, HELP, мы парализованы",
    "кластер упал, весь dev стенд недоступен, срочно чините",
    "на сервере место закончилось, деплой фейлится",
    "балансировщик упал, половина запросов в ошибку уходит",
    "No space left on device, logs заполнили всё",
    "репликация сломалась, данные не синхронизируются",
    "прод упал, rollback не помогает, raising incident",
  ],
};

// 🎭 Эмоции/реакции
const emotions = [
  "", "😡 ", "🤬 ", "😭 ", "😱 ", "💀 ", "🔥 ", "🤯 ", "💔 ", "⚠️ ", "❗️", 
  "ОЧЕНЬ БЕСИТ что ", "БЛИН ", "КОШМАР ", "ДА ЗАЧЕМ ", "ОФИГЕТЬ ", 
  "😡 КАПЕЦ ", "😭 ну блин ", "🤬 СНОВА ", "Ё-май ", "😩 ", "ПИПЕЦ ",
];

// 💬 Сленговые вставки
const slangs = [
  "", " полный ппц", " просто кирдык", " лагает жёстко", " тупо виснет",
  " ваще не пашет", " как черепаха", " лежит пластом", " крашнулось",
  " потухло", " сдохло", " глючит по-чёрному", " тормозит ужасно",
  " в ауте", " упало в тартарары", " гори огнём", " полетело к чертям",
];

// 🔄 Сокращения слов
const abbreviations = {
  "не работает": "нерабоч|не робит|no work|мертво|в ступоре|сломано",
  "не подключается": "не коннектится|no connect|не воткнуть|не цепляется",
  "очень медленный": "тупой|тормозной|слоупок|медляк|дохлый",
  "падает": "летит|крашится|сваливается|гори оно огнём|падает в пропасть",
  "ошибка": "error|фейл|баг|exception|ошибка майор",
  "приложение": "app|прога|софт|программка",
  "сервер": "сервак|сервачок|машина",
  "база данных": "бд|database|база",
  "антивирус": "antivirus|защита|каспер|аваст",
  "клавиатура": "клава|кейборд",
  "монитор": "экран|дисплей|матрица",
};

function applyAbbreviation(text) {
  for (const [key, variants] of Object.entries(abbreviations)) {
    if (text.includes(key)) {
      const variantList = variants.split("|");
      const replacement = variantList[Math.floor(Math.random() * variantList.length)];
      text = text.replace(key, replacement);
      break;
    }
  }
  return text;
}

function randomCase(text) {
  if (Math.random() > 0.4) return text;
  return text.split(" ").map(word => {
    if (word.length > 3 && Math.random() > 0.7) {
      return word.toUpperCase();
    }
    if (Math.random() > 0.85) {
      return word.toLowerCase();
    }
    return word;
  }).join(" ");
}

const prefixes = [
  "Постоянно", "Периодически", "После обновления", "Сотрудник жалуется что",
  "Заметили что", "Срочно!", "Внимание!", "Пользователь пишет что",
  "Система алерт:", "Мониторинг показал", "Help!", "❗️АЛЕРТ❗️",
  "Помогите", "SOS", "СРОЧНО!", "Problema:",
];

const suffixes = [
  "в офисе", "у удалёнки", "на ноуте", "в сети", "в битве",
  "у клиента", "на проде", "на тесте", "у сотрудников", "в отделе",
];

const rand = (arr) => arr[(Math.random() * arr.length) | 0];

function enhanceText(base) {
  let text = base;
  
  if (Math.random() > 0.5) {
    const emotion = rand(emotions);
    text = emotion + text;
  }
  
  if (Math.random() > 0.6) {
    const slang = rand(slangs);
    text = text + slang;
  }
  
  text = applyAbbreviation(text);
  
  if (Math.random() > 0.5) {
    const p = rand(prefixes);
    text = `${p} ${text}`;
  }
  if (Math.random() > 0.65) {
    const s = rand(suffixes);
    text = `${text} ${s}`;
  }
  
  text = randomCase(text);
  
  // Добавляем случайные опечатки (5% вероятность)
  if (Math.random() > 0.95) {
    text = text.replace(/[аеиоуыэюя]/i, () => {
      const vowels = "аеиоуыэюя";
      return vowels[Math.floor(Math.random() * vowels.length)];
    });
  }
  
  return text.trim();
}

// Генерация с учётом всех вариантов
function generateEnhancedDataset(targetSize = 7000) {
  const uniqueMap = new Map();
  const data = [];
  
  // Считаем сколько нужно из каждого источника
  const crossCount = Math.floor(targetSize * 0.15);     // 15% кросс-категорийные
  const noiseCount = Math.floor(targetSize * 0.15);     // 15% шум
  const ambiguousCount = Math.floor(targetSize * 0.15); // 15% размытые границы
  const realCount = Math.floor(targetSize * 0.25);      // 25% real-style
  const templateCount = targetSize - (crossCount + noiseCount + ambiguousCount + realCount); // 30% шаблонные
  
  console.log(`📊 Распределение:`);
  console.log(`   - Шаблонные: ${templateCount}`);
  console.log(`   - Кросс-категорийные: ${crossCount}`);
  console.log(`   - Шум/нейтральные: ${noiseCount}`);
  console.log(`   - Размытые границы: ${ambiguousCount}`);
  console.log(`   - Real-style: ${realCount}`);
  
  // 1. ШАБЛОННЫЕ (исходные)
  const keys = Object.keys(categories);
  let generated = 0;
  let attempts = 0;
  
  while (generated < templateCount && attempts < templateCount * 10) {
    const category = keys[(Math.random() * keys.length) | 0];
    const baseArr = categories[category];
    const base = baseArr[(Math.random() * baseArr.length) | 0];
    let text = enhanceText(base);
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, category);
      generated++;
    }
    attempts++;
  }
  
  // 2. КРОСС-КАТЕГОРИЙНЫЕ
  generated = 0;
  attempts = 0;
  while (generated < crossCount && attempts < crossCount * 10) {
    const cross = rand(crossIssues);
    const category = rand(cross.categories);
    let text = enhanceText(cross.text);
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, category);
      generated++;
    }
    attempts++;
  }
  
  // 3. ШУМ И НЕЙТРАЛЬНЫЕ
  generated = 0;
  attempts = 0;
  while (generated < noiseCount && attempts < noiseCount * 10) {
    const noise = rand(noiseQueries);
    let category = noise.category;
    
    // Если категория null - пропускаем или помечаем как ближайшую
    if (category === null) {
      // 50% пропускаем (шум), 50% назначаем рандомно
      if (Math.random() > 0.5) {
        continue;
      }
      category = rand(keys);
    }
    
    let text = enhanceText(noise.text);
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, category);
      generated++;
    }
    attempts++;
  }
  
  // 4. РАЗМЫТЫЕ ГРАНИЦЫ
  generated = 0;
  attempts = 0;
  while (generated < ambiguousCount && attempts < ambiguousCount * 10) {
    const ambiguous = rand(ambiguousIssues);
    const category = rand(ambiguous.possibleCategories);
    let text = enhanceText(ambiguous.text);
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, category);
      generated++;
    }
    attempts++;
  }
  
  // 5. REAL-STYLE
  generated = 0;
  attempts = 0;
  const realKeys = Object.keys(realUserComplaints);
  while (generated < realCount && attempts < realCount * 10) {
    const category = rand(realKeys);
    const complaints = realUserComplaints[category];
    const base = rand(complaints);
    let text = enhanceText(base);
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, category);
      generated++;
    }
    attempts++;
  }
  
  // Конвертируем в массив
  for (const [text, label] of uniqueMap.entries()) {
    data.push({ text, label });
  }
  
  return data;
}

// ---- RUN ----
console.log("🚀 Запуск генерации улучшенного датасета...\n");
console.time("total_generation");

const dataset = generateEnhancedDataset(7000); // 7к записей

console.timeEnd("total_generation");

console.log(`\n✅ Уникальных записей: ${dataset.length}`);

// Статистика по категориям
const stats = {};
dataset.forEach(item => {
  stats[item.label] = (stats[item.label] || 0) + 1;
});

console.log("\n📊 Распределение по категориям:");
Object.entries(stats).sort().forEach(([cat, count]) => {
  const percent = ((count / dataset.length) * 100).toFixed(1);
  console.log(`   ${cat.padEnd(15)}: ${count} (${percent}%)`);
});

// Показываем примеры
console.log("\n📋 ПРИМЕРЫ СГЕНЕРИРОВАННЫХ ОБРАЩЕНИЙ:\n");

const examples = [];
for (let i = 0; i < 20; i++) {
  const randomIndex = Math.floor(Math.random() * dataset.length);
  examples.push(dataset[randomIndex]);
}

// Группируем по категориям для наглядности
const byCategory = {};
examples.forEach(ex => {
  if (!byCategory[ex.label]) byCategory[ex.label] = [];
  byCategory[ex.label].push(ex.text);
});

for (const [cat, texts] of Object.entries(byCategory)) {
  console.log(`\n🔷 [${cat.toUpperCase()}]`);
  texts.slice(0, 3).forEach((text, idx) => {
    console.log(`   ${idx+1}. ${text}`);
  });
}

// Сохраняем в файл
console.time("\n💾 Запись файла");
fs.writeFileSync("dataset_enhanced.json", JSON.stringify(dataset, null, 0));
console.timeEnd("💾 Запись файла");

console.log(`\n✅ Датасет сохранён: dataset_enhanced.json`);
console.log(`📊 Всего записей: ${dataset.length}`);
console.log(`🎯 Уникальность: ${dataset.length === new Set(dataset.map(d => d.text)).size ? "100%" : "есть дубли"}`);