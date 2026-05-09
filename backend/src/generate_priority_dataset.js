import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================
// ПУТИ
// =====================
const BASE_DIR = path.resolve(__dirname, "..");
const BACKEND_DIR = path.join(BASE_DIR, "backend");
const OUTPUT_PATH = path.join("dataset_with_priority.json");

console.log("🚀 Генерация УЛУЧШЕННОГО датасета с приоритетами...\n");

// =====================
// ПРИОРИТЕТЫ (1 - самый важный) с РАЗВЕРНУТЫМИ маркерами
// =====================
const priorityMarkers = {
  1: {  // КРИТИЧЕСКИЙ - бизнес полностью остановлен
    name: "Critical",
    markers: [
      "весь отдел не работает", "бизнес парализован", "работа полностью встала",
      "клиенты не могут оплатить", "срыв сдачи отчета", "дедлайн сегодня",
      "все сотрудники не могут войти", "производство остановлено",
      "касса не работает", "торговля остановлена", "склад не отгружает товар",
      "сервер с клиентами упал", "продажи остановлены", "не выгрузить документы",
      "бухгалтерия не сдает отчет", "зависла производственная линия",
      "компания терпит убытки", "бизнес-процесс полностью заблокирован",
      "не можем принять заказ", "система недоступна для всех"
    ]
  },
  
  2: {  // ВЫСОКИЙ - работа сильно затруднена, дедлайн под угрозой
    name: "High",
    markers: [
      "часть сотрудников не работает", "клиенты массово жалуются",
      "база данных падает", "сервер перегружен", "риск срыва срока",
      "под угрозой сдача проекта", "зависла важная операция",
      "отдел не справляется с объемом", "много пользователей страдает",
      "критический процесс замедлился", "работа отдела парализована",
      "не можем провести платежи", "система работает с ошибками",
      "задержка в обработке заказов", "клиенты не видят свои данные",
      "репутация компании под угрозой"
    ]
  },
  
  3: {  // СРЕДНИЙ - работа возможна, но с трудностями
    name: "Medium",
    markers: [
      "сильно тормозит работа", "все долго грузится", "зависает постоянно",
      "приходится перезагружать каждый час", "тратим много времени",
      "продуктивность упала на 50%", "работать тяжело и неудобно",
      "ждем по минуте каждый клик", "программа вылетает периодически",
      "интернет медленный как черепаха", "почта приходит с задержкой 5 минут",
      "база данных отвечает через раз", "VPN обрывается каждый час",
      "печать занимает в 3 раза больше времени", "файлы открываются минуту"
    ]
  },
  
  4: {  // НИЗКИЙ - есть обходной путь, продуктивность немного снижена
    name: "Low",
    markers: [
      "немного неудобно", "слегка раздражает", "мешает но терпимо",
      "можно обойтись другим способом", "раньше работало быстрее",
      "можно работать, но бесит", "мелкая ошибка в интерфейсе",
      "не работает одна кнопка", "приходится делать лишние движения",
      "не критично, но хотелось бы починить", "визуальный баг",
      "не работает горячая клавиша", "шрифт мелковат", "немного тормозит"
    ]
  },
  
  5: {  // ИНФОРМАЦИОННЫЙ - работа не заблокирована
    name: "Info",
    markers: [
      "как сделать", "научите", "покажите", "объясните",
      "хочу узнать", "интересует функция", "возможно ли",
      "что делать если", "как настроить", "где найти",
      "подскажите пожалуйста", "помогите разобраться",
      "вопрос по работе системы", "нужна консультация",
      "как пользоваться", "покажите инструкцию", "объясните процесс"
    ]
  }
};

// =====================
// КАТЕГОРИИ (из существующего датасета)
// =====================
const categories = {
  network: [
    "Wi-Fi работает нестабильно", "не подключается VPN", "очень медленный интернет",
    "падает соединение с сетью", "нет доступа к внутренним ресурсам",
    "DNS не резолвит адреса", "обрывается соединение", "не работает корпоративная сеть"
  ],
  software: [
    "приложение вылетает при запуске", "ошибка авторизации в системе",
    "не открывается корпоративная система", "ошибка при обновлении программы",
    "система зависает при работе", "не работает экспорт отчёта",
    "не запускается приложение", "ошибка лицензии"
  ],
  hardware: [
    "ноутбук перегревается", "не работает клавиатура", "монитор не включается",
    "жёсткий диск издаёт шум", "не работает USB порт", "быстро разряжается батарея",
    "мышь не реагирует", "компьютер не включается"
  ],
  security: [
    "подозрительный вход в систему", "антивирус блокирует файлы",
    "учётная запись заблокирована", "фишинговое письмо получено",
    "подозрительная активность в аккаунте", "попытка взлома аккаунта",
    "фаервол блокирует доступ", "возможна утечка данных"
  ],
  infrastructure: [
    "сервер недоступен", "ошибка базы данных", "облачный сервис не работает",
    "сбой резервного копирования", "балансировщик нагрузки упал",
    "заканчивается место на сервере", "кластер недоступен", "инфраструктура перегружена"
  ]
};

// =====================
// КОНКРЕТНЫЕ ПРИМЕРЫ ДЛЯ КАЖДОГО ПРИОРИТЕТА (смешанные с категориями)
// =====================
const detailedExamples = {
  1: [
    { text: "весь отдел продаж не работает, CRM не открывается", category: "software" },
    { text: "касса не работает, магазин не может принимать оплату", category: "hardware" },
    { text: "сервер упал, все клиенты потеряны, бизнес стоп", category: "infrastructure" },
    { text: "бухгалтерия не может сдать отчет в налоговую", category: "software" },
    { text: "производственная линия зависла, цех стоит", category: "hardware" },
    { text: "все сотрудники не могут зайти в систему, работа встала", category: "security" }
  ],
  2: [
    { text: "часть клиентов не видят свои заказы в личном кабинете", category: "software" },
    { text: "сервер перегружен, база данных отвечает через раз", category: "infrastructure" },
    { text: "отдел закупок не может оформить заявки уже час", category: "software" },
    { text: "клиенты массово жалуются на медленную работу сайта", category: "network" },
    { text: "риск срыва срока сдачи проекта из-за ошибок в системе", category: "software" },
    { text: "финансовый отдел не может провести платежи", category: "security" }
  ],
  3: [
    { text: "1С тормозит, документы открываются по минуте", category: "software" },
    { text: "интернет очень медленный, работать невозможно", category: "network" },
    { text: "приходится перезагружать компьютер каждый час", category: "hardware" },
    { text: "почта приходит с задержкой 10 минут", category: "network" },
    { text: "программа вылетает при открытии больших файлов", category: "software" },
    { text: "VPN постоянно обрывается, приходится переподключаться", category: "network" }
  ],
  4: [
    { text: "не работает горячая клавиша Ctrl+S, приходится мышкой", category: "software" },
    { text: "надоело окно с ошибкой при запуске, но всё работает", category: "software" },
    { text: "мелкий баг в интерфейсе, шрифт съехал", category: "software" },
    { text: "мышь иногда подвисает на секунду", category: "hardware" },
    { text: "не сохраняется последнее открытое окно программы", category: "software" },
    { text: "шрифт слишком мелкий, напрягает глаза", category: "hardware" }
  ],
  5: [
    { text: "как подключить второй монитор к ноутбуку?", category: "hardware" },
    { text: "покажите инструкцию по работе с CRM системой", category: "software" },
    { text: "как настроить автоответ в Outlook?", category: "software" },
    { text: "где найти лог-файлы программы?", category: "software" },
    { text: "можно ли работать из дома через VPN?", category: "network" },
    { text: "объясните, как пользоваться новым чатом", category: "software" }
  ]
};

// =====================
// ТРАНСФОРМАЦИИ ТЕКСТА (для разнообразия)
// =====================
const prefixes = ["", "❗️", "⚠️ ", "Помогите: ", "Срочно! ", "Проблема: "];
const suffixes = ["", "!!!", "(((", " пожалуйста", " срочно", " уже час"];
const emotions = ["", "😡", "😭", "🔥", "🤬", "💀"];

const rand = (arr) => arr[(Math.random() * arr.length) | 0];

function enhanceText(text, priority) {
  let result = text;
  
  // Для критических приоритетов добавляем эмоции
  if (priority <= 2 && Math.random() > 0.6) {
    result = rand(emotions) + " " + result;
  }
  
  // Добавляем префикс
  if (Math.random() > 0.5 && priority <= 3) {
    result = rand(prefixes) + result;
  }
  
  // Добавляем суффикс
  if (Math.random() > 0.7) {
    result = result + rand(suffixes);
  }
  
  // Рандомный регистр (редко)
  if (Math.random() > 0.95) {
    result = result.toUpperCase();
  }
  
  return result.trim();
}

// =====================
// ОСНОВНАЯ ГЕНЕРАЦИЯ
// =====================
function generateBalancedDataset(targetSize = 15000) {
  const dataset = [];
  const categoriesList = Object.keys(categories);
  
  // НОВОЕ РАСПРЕДЕЛЕНИЕ (более сбалансированное, без доминирования P5)
  const distribution = [
    { priority: 1, weight: 0.10 },  // 10% - критические
    { priority: 2, weight: 0.20 },  // 20% - высокие
    { priority: 3, weight: 0.35 },  // 35% - средние
    { priority: 4, weight: 0.20 },  // 20% - низкие
    { priority: 5, weight: 0.15 }   // 15% - информационные
  ];
  
  function selectPriority() {
    const r = Math.random();
    let cumulative = 0;
    for (const item of distribution) {
      cumulative += item.weight;
      if (r < cumulative) return item.priority;
    }
    return 3;
  }
  
  for (let i = 0; i < targetSize; i++) {
    const priority = selectPriority();
    let text = "";
    let category = "";
    
    // Выбираем источник (разнообразие)
    const sourceType = Math.random();
    
    // 40% - маркер + категория
    if (sourceType < 0.4) {
      const marker = rand(priorityMarkers[priority].markers);
      category = rand(categoriesList);
      const problem = rand(categories[category]);
      text = `${marker}: ${problem}`;
    }
    // 30% - детальные примеры
    else if (sourceType < 0.7) {
      const example = rand(detailedExamples[priority]);
      text = example.text;
      category = example.category;
    }
    // 20% - маркер с конкретикой
    else if (sourceType < 0.9) {
      const marker = rand(priorityMarkers[priority].markers);
      category = rand(categoriesList);
      
      const specifics = {
        network: ["роутер", "коммутатор", "точка доступа", "кабель"],
        software: ["обновление", "установка", "настройки", "лицензия"],
        hardware: ["вентилятор", "блок питания", "материнская плата", "оперативная память"],
        security: ["сертификат", "политика", "журнал аудита", "доступ"],
        infrastructure: ["контейнер", "виртуалка", "репликация", "бэкап"]
      };
      
      const specific = rand(specifics[category]);
      text = `${marker}, проблема с ${specific}`;
    }
    // 10% - короткие сообщения (реалистичные)
    else {
      const shortMessages = {
        1: ["всё упало", "работа встала", "бизнес стоп"],
        2: ["сервер еле дышит", "клиенты недовольны", "сроки горят"],
        3: ["всё тормозит", "вылетает постоянно", "зависло"],
        4: ["бесит мелкая ошибка", "неудобно сделано"],
        5: ["вопрос", "как сделать", "подскажи"]
      };
      text = rand(shortMessages[priority]);
      category = rand(categoriesList);
    }
    
    // Улучшаем текст
    text = enhanceText(text, priority);
    
    dataset.push({
      text: text,
      category: category,
      priority: priority
    });
  }
  
  return dataset;
}

// =====================
// ЗАПУСК
// =====================
console.log("📊 Генерация сбалансированного датасета...\n");

const dataset = generateBalancedDataset(15000);

// Статистика
const priorityStats = {};
const categoryStats = {};

dataset.forEach(item => {
  priorityStats[item.priority] = (priorityStats[item.priority] || 0) + 1;
  categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
});

console.log("📊 НОВОЕ РАСПРЕДЕЛЕНИЕ ПРИОРИТЕТОВ:");
for (let p = 1; p <= 5; p++) {
  const count = priorityStats[p] || 0;
  const percent = (count / dataset.length * 100).toFixed(1);
  const bar = "█".repeat(Math.floor(percent / 2));
  console.log(`   Priority ${p} (${priorityMarkers[p].name.padEnd(8)}): ${count} (${percent}%) ${bar}`);
}

console.log("\n📊 Распределение по категориям:");
for (const [cat, count] of Object.entries(categoryStats)) {
  const percent = (count / dataset.length * 100).toFixed(1);
  console.log(`   ${cat.padEnd(12)}: ${count} (${percent}%)`);
}

// Примеры для проверки
console.log("\n📋 ПРИМЕРЫ ПО КАЖДОМУ ПРИОРИТЕТУ:\n");

for (let p = 1; p <= 5; p++) {
  const examples = dataset.filter(item => item.priority === p).slice(0, 4);
  console.log(`\n🔴 Priority ${p} (${priorityMarkers[p].name}):`);
  examples.forEach((ex, i) => {
    console.log(`   ${i+1}. [${ex.category}] ${ex.text.substring(0, 90)}`);
  });
}

// Сохраняем
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 0));
console.log(`\n💾 Датасет сохранён: ${OUTPUT_PATH}`);
console.log(`📊 Всего записей: ${dataset.length}`);

// Проверка на дубликаты
const uniqueTexts = new Set(dataset.map(d => d.text));
console.log(`🎯 Уникальных текстов: ${uniqueTexts.size} (${(uniqueTexts.size/dataset.length*100).toFixed(1)}%)`);