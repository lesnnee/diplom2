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

// ========== НОВЫЕ ДАННЫЕ ДЛЯ SECURITY (ДОБАВЛЕНО 50+ ПРИМЕРОВ) ==========
const securityAdditional = [
  // Реальные сценарии безопасности
  "получил письмо с подозрительной ссылкой",
  "антивирус нашел угрозу в скачанном файле",
  "кто-то пытается войти в мой аккаунт из другой страны",
  "заблокировали учетную запись за нарушение политики",
  "фаервол блокирует доступ к корпоративному порталу",
  "подозрительная активность в системе мониторинга",
  "неизвестное устройство подключилось к сети",
  "сертификат безопасности истек",
  "двухфакторная аутентификация не работает",
  "пароль истек, не могу сменить",
  "пришло SMS с кодом подтверждения, я не запрашивал",
  "антифишинговый фильтр блокирует легитимные сайты",
  "интернет-банк недоступен после смены пароля",
  "утекли корпоративные данные в открытый доступ",
  "вирус-шифровальщик заблокировал все файлы",
  "компьютер ведет себя странно, сам открывает программы",
  "появились неизвестные расширения в браузере",
  "кто-то меняет мои настройки без моего ведома",
  "получено предупреждение о критической уязвимости",
  "нужно обновить политику безопасности",
  "пользователь скачал вредоносный файл",
  "обнаружены множественные неудачные попытки входа",
  "сработал датчик вторжения в ЦОД",
  "компьютер в карантине сети из-за вируса",
  "антивирус отключен без моего согласия",
  "фаервол пропускает запрещенный трафик",
  "обнаружена подозрительная сетевая активность",
  "система требует смену пароля каждые 3 дня",
  "не могу зайти в аккаунт после блокировки",
  "приложение запрашивает избыточные права доступа",
];

// ========== НОВЫЕ ДАННЫЕ ДЛЯ NETWORK (ДОБАВЛЕНО 50+ ПРИМЕРОВ) ==========
const networkAdditional = [
  // Сетевые проблемы всех видов
  "пропадает ping до корпоративного шлюза",
  "высокая задержка при работе с облаком",
  "пакеты теряются на маршрутизаторе",
  "не резолвятся внутренние DNS имена",
  "VPN туннель постоянно обрывается",
  "не могу получить IP по DHCP",
  "MAC-фильтрация на точке доступа заблокировала устройство",
  "порт на свитче отключился сам по себе",
  "STP блокирует порт из-за петли",
  "балансировщик нагрузки не распределяет трафик",
  "QoS не приоритезирует голосовой трафик",
  "NAT не работает для внутренних сервисов",
  "плохой сигнал wi-fi в конференц-зале",
  "сетевой принтер не виден по сети",
  "не открываются порты для RDP",
  "проблемы с BGP на маршрутизаторе",
  "интернет через прокси не работает",
  "не могу зайти в админку роутера",
  "wi-fi сеть видна, но пароль не подходит",
  "периодически отваливается сеть при большой нагрузке",
  "не открывается корпоративный портал по HTTPS",
  "в браузере ошибка ERR_CONNECTION_REFUSED",
  "сервер выдает 504 Gateway Timeout",
  "ping до google 500ms, очень медленно",
  "потеря пакетов 50% до 8.8.8.8",
  "маршрут до сервера идет через лишние хопы",
  "vlan настройки сбились после перезагрузки",
  "сетевой экран отрубил доступ по 443 порту",
  "не работает IPv6 на внешнем интерфейсе",
  "команда traceroute показывает звездочки",
];

// ========== НОВЫЕ ДАННЫЕ ДЛЯ РАЗДЕЛЕНИЯ HARDWARE VS SOFTWARE ==========
const hardwareSoftwareDistinguishers = {
  // Чисто hardware проблемы (железо)
  hardware: [
    "ноутбук не включается даже от розетки",
    "кулер сильно шумит и гремит",
    "жесткий диск издает странные щелчки",
    "материнская плата не запускается",
    "оперативная память не определяется",
    "видеокарта выдает артефакты на экране",
    "блок питания не подает напряжение",
    "процессор перегревается до 90 градусов",
    "запах гари от системного блока",
    "компьютер выключается сам через 5 минут",
    "клавиша залипла на клавиатуре",
    "сенсорная панель не реагирует на касания",
    "веб-камера не определяется системой",
    "микрофон не работает в наушниках",
    "провод зарядного устройства перетерся",
    "разъем для зарядки болтается",
    "динамики хрипят при воспроизведении",
    "чехол ноутбука треснул",
    "экран поцарапан, мешает работать",
    "петля экрана разболталась",
  ],
  
  // Чисто software проблемы (софт)
  software: [
    "программа выдает ошибку при запуске",
    "после обновления перестали работать макросы",
    "не устанавливается драйвер для принтера",
    "операционная система не грузится",
    "синий экран смерти при загрузке",
    "ошибка 0x80070005 при сохранении",
    "приложение зависает при работе с большими данными",
    "не могу удалить программу из системы",
    "реесстр захламлен, нужно чистить",
    "плагин для браузера вызывает конфликт",
    "cookie не сохраняются на сайте",
    "кеш браузера не очищается",
    "файл поврежден, не открывается",
    "нет доступа к системной папке",
    "служба Windows не запускается",
    "обновление не устанавливается с ошибкой",
    "лицензия активируется не на том компьютере",
    "программа не видит библиотеки DLL",
    "Java не запускает приложение",
    "фреймворк требует более новую версию",
  ],
  
  // Смешанные (сложные кейсы)
  ambiguous: [
    "после перегрева стала вылетать программа",
    "зависла система при открытии тяжелого файла",
    "обновление BIOS убило загрузчик",
    "синий экран после замены оперативной памяти",
    "при запуске игры выключается компьютер",
    "видео тормозит из-за старой видеокарты",
    "SSD медленно работает после установки софта",
    "ноутбук греется при компиляции кода",
    "драйвер вызывает конфликт с новым обновлением",
    "после установки антивируса перестал работать звук",
  ]
};

// ========== УНИКАЛЬНЫЕ МАРКЕРЫ ДЛЯ SECURITY ==========
const securityUniqueMarkers = [
  "двухфакторная аутентификация",
  "сертификат безопасности",
  "шифрование данных",
  "электронная подпись",
  "журнал безопасности",
  "антивирусная защита",
  "межсетевой экран",
  "система обнаружения вторжений",
  "политика паролей",
  "биометрическая аутентификация",
  "одноразовый код",
  "push-уведомление",
  "токен безопасности",
  "смарт-карта",
  "RSA ключ",
  "SSL сертификат",
  "TLS шифрование",
  "PGP подпись",
  "SSH ключ",
  "идентификатор сессии",
];

// ========== КРОСС-КАТЕГОРИЙНЫЕ ПРОБЛЕМЫ ==========
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
  // Новые кросс-проблемы с security
  { text: "вирус отключил антивирус и теперь не работает интернет", categories: ["security", "network"] },
  { text: "хакеры взломали сервер аутентификации", categories: ["security", "infrastructure"] },
  { text: "фишинг украл пароль от корпоративной почты", categories: ["security", "software"] },
  { text: "вирус-майнер нагружает процессор", categories: ["security", "hardware"] },
];

// ========== ШУМ И НЕЙТРАЛЬНЫЕ ОБРАЩЕНИЯ ==========
const noiseQueries = [
  { text: "как поменять пароль?", category: "security" },
  { text: "где найти документ?", category: null },
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
  { text: "какой сегодня график?", category: null },
  { text: "кто дежурный?", category: null },
  { text: "почему нет кофе?", category: null },
  // Новые шумовые запросы
  { text: "как получить доступ к корпоративной базе?", category: "security" },
  { text: "можно ли удаленно работать?", category: "network" },
  { text: "нужно заменить термопасту", category: "hardware" },
];

// ========== РАЗМЫТЫЕ ГРАНИЦЫ ==========
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
  { text: "комп странно себя ведет", possibleCategories: ["hardware", "security"] },
  { text: "что-то не так с компом", possibleCategories: ["hardware", "software"] },
  // Новые размытые границы
  { text: "ноутбук выключается при запуске тяжелой программы", possibleCategories: ["hardware", "software"] },
  { text: "после визита антивируса пропал интернет", possibleCategories: ["security", "network"] },
];

// ========== REAL USER-STYLE СООБЩЕНИЯ (расширенные) ==========
const realUserQueries = {
  network: [
    "всё виснет уже час, ютуб не грузит, помогите!!!",
    "котики в дискорде не открываются, вайфай горит огнём 🤬",
    "сервак наш умер, все домой идём? или как?",
    "инет как черепаха, даже почта не открывается 😭",
    "вайфай есть а интернета нет, чё за нафиг?",
    "днс не резолвится, site not found error",
    "пнг 500 стабильно, весь офис стоит",
    // Новые от пользователей
    "интернет отваливается каждый час ровно, перезагрузка роутера не помогает",
    "vpn коннектится но трафик не идет, настройки слетели",
    "в браузере ошибка ERR_ADDRESS_UNREACHABLE при заходе на любой сайт",
    "только у меня не работает доступ к серверу, у других все ок",
    "сигнал вайфай слабый, надо усилитель ставить",
  ],
  software: [
    "программа крашнулась с ошибкой 0х00005, чё делать?",
    "эксель не сохраняет файл, бесит просто ппц",
    "1С тупит и не открывает базу, мы не работаем уже час",
    "короче, апдейт убил всю систему, откатите плиз",
    "приложение вылетает на старте, переустановка не помогла",
    "нет лицензии? но мы же купили! проверьте срочно",
    "база данных не отвечает, sql error 4060",
    // Новые от пользователей
    "после обновления Chrome перестали работать расширения",
    "Word при сохранении документа пишет 'недостаточно памяти'",
    "IDE стала тормозить и вылетать при компиляции",
    "не могу зайти в систему после смены пароля в AD",
    "отчет не экспортируется в PDF, выдает неизвестную ошибку",
  ],
  hardware: [
    "ноут греется как утюг, яичницу жарить можно 🔥",
    "клава не печатает букву 'о', бесит просто ппц, как работать?",
    "комп не включается нафиг почините срочно!",
    "мышь дёргается и клацает сама по себе, это венда? или вирус?",
    "экран моргает и полоски какие-то, хз чё случилось",
    "usb порты сдохли все, мышку не подключить(((",
    "батарея живёт час максимум, ноут отключается резко",
    // Новые от пользователей
    "сегодня ноутбук сам выключился и больше не включается",
    "клавиатура залита кофе, часть клавиш не работает",
    "винчестер издает скрежет и система зависает",
    "монитор показывает только половину экрана",
  ],
  security: [
    "взломали аккаунт? пришло письмо со сменой пароля, я не менял!!!",
    "антивирус орет что троян, но это наш софт, добавьте в исключения",
    "какая-то хуйня, все файлы .encrypted стали, это вирус?",
    "фаервол блокирует всё подряд, даже интернет не работает",
    "учётку заблокировали за подозрительную активность, разблокируйте пж",
    "фишинг пришёл якобы от директора, все нажали уже))) чё делать?",
    "подозрительный вход из турции, это не я!!",
    // Новые от пользователей
    "двухфакторка не приходит на телефон, уже час не могу зайти",
    "у меня запросили пароль по телефону, я сказал, теперь боюсь",
    "сертификат безопасности на сайте устарел, браузер ругается",
    "антивирус нашел и удалил файл, но он был ваажне!",
    "кто-то пытается сбросить мой пароль, приходят письма",
  ],
  infrastructure: [
    "сервер лежит, база не коннектится, HELP, мы парализованы",
    "кластер упал, весь dev стенд недоступен, срочно чините",
    "на сервере место закончилось, деплой фейлится",
    "балансировщик упал, половина запросов в ошибку уходит",
    "No space left on device, logs заполнили всё",
    "репликация сломалась, данные не синхронизируются",
    "прод упал, rollback не помогает, raising incident",
    // Новые от пользователей
    "API gateway возвращает 502 Bad Gateway для всех сервисов",
    "k8s под не стартует, образ не пуллится",
    "закончились индексы в Elasticsearch, поиск не работает",
    "очередь сообщений переполнена, consumer не успевает",
    "бэкапы не создаются уже неделю, место на кластере закончилось",
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
  "двухфакторная аутентификация": "2fa|двухфакторка|mfa",
  "вирус": "троян|вредонос|зловред",
};

// Функция добавления опечаток
function addTypo(text) {
  if (Math.random() > 0.85) {
    const typos = {
      "работает": ["работат", "рботает", "работаит"],
      "компьютер": ["компьюир", "компютер", "кампьютер"],
      "интернет": ["интерент", "интерне", "инетрнет"],
      "приложение": ["приложени", "праложение"],
      "сервер": ["сервир", "сирвер"],
      "клавиатура": ["клавиату", "клавватура"],
      "монитор": ["монитр", "манитор"],
      "ошибка": ["ашибка", "ошипка"],
      "безопасность": ["безопастность", "безпасность"],
      "антивирус": ["антивирус", "антивирюс"],
    };
    for (const [correct, typosList] of Object.entries(typos)) {
      if (text.includes(correct) && Math.random() > 0.7) {
        const typo = typosList[Math.floor(Math.random() * typosList.length)];
        text = text.replace(new RegExp(correct, 'g'), typo);
        break;
      }
    }
  }
  return text;
}

// Функция добавления разговорных фраз
function addConversational(text) {
  const conversationalPhrases = [
    "блин", "ну сколько можно", "каждый день одно и то же",
    "задолбало уже", "вы там вообще чините?", "что за наказание"
  ];
  if (Math.random() > 0.6) {
    const phrase = conversationalPhrases[Math.floor(Math.random() * conversationalPhrases.length)];
    if (Math.random() > 0.5) {
      text = `${phrase}, ${text.toLowerCase()}`;
    } else {
      text = `${text}, ${phrase}`;
    }
  }
  return text;
}

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
  if (Math.random() > 0.45) return text;
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
  
  text = addConversational(text);
  
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
  text = addTypo(text);
  
  return text.trim();
}

// Генерация с фокусом на проблемные категории
function generateEnhancedDataset(targetSize = 12000) {
  const uniqueMap = new Map();
  const data = [];
  
  // НОВОЕ РАСПРЕДЕЛЕНИЕ с акцентом на проблемные категории
  const templateCount = Math.floor(targetSize * 0.10);      // 10% шаблонные
  const securityBoostCount = Math.floor(targetSize * 0.18); // 18% security (было 0%)
  const networkBoostCount = Math.floor(targetSize * 0.18);  // 18% network (было 0%)
  const hardwareSoftwareCount = Math.floor(targetSize * 0.15); // 15% для разделения HW/SW
  const crossCount = Math.floor(targetSize * 0.10);         // 10% кросс-категорийные
  const noiseCount = Math.floor(targetSize * 0.07);         // 7% шум
  const ambiguousCount = Math.floor(targetSize * 0.07);     // 7% размытые границы
  const realCount = Math.floor(targetSize * 0.15);          // 15% real-style
  
  console.log(`📊 НОВОЕ РАСПРЕДЕЛЕНИЕ (фокус на проблемные категории):`);
  console.log(`   - Шаблонные: ${templateCount}`);
  console.log(`   - 🔐 SECURITY (доп. данные): ${securityBoostCount} ← УВЕЛИЧЕНО`);
  console.log(`   - 🌐 NETWORK (доп. данные): ${networkBoostCount} ← УВЕЛИЧЕНО`);
  console.log(`   - 🖥️ HARDWARE vs SOFTWARE: ${hardwareSoftwareCount} ← НОВОЕ`);
  console.log(`   - Кросс-категорийные: ${crossCount}`);
  console.log(`   - Шум/нейтральные: ${noiseCount}`);
  console.log(`   - Размытые границы: ${ambiguousCount}`);
  console.log(`   - Real-style: ${realCount}`);
  
  const keys = Object.keys(categories);
  let generated = 0;
  let attempts = 0;
  
  // 1. ШАБЛОННЫЕ (исходные)
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
  
  // 2. ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ SECURITY (УВЕЛИЧЕННЫЙ ВЕС)
  generated = 0;
  attempts = 0;
  while (generated < securityBoostCount && attempts < securityBoostCount * 10) {
    const base = rand(securityAdditional);
    let text = enhanceText(base);
    
    // Добавляем уникальные маркеры для разнообразия
    if (Math.random() > 0.5) {
      const marker = rand(securityUniqueMarkers);
      text = `${text}, проблема с ${marker}`;
    }
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, "security");
      generated++;
    }
    attempts++;
  }
  
  // 3. ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ NETWORK (УВЕЛИЧЕННЫЙ ВЕС)
  generated = 0;
  attempts = 0;
  while (generated < networkBoostCount && attempts < networkBoostCount * 10) {
    const base = rand(networkAdditional);
    let text = enhanceText(base);
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, "network");
      generated++;
    }
    attempts++;
  }
  
  // 4. HARDWARE vs SOFTWARE РАЗДЕЛЕНИЕ (НОВЫЙ БЛОК)
  generated = 0;
  attempts = 0;
  while (generated < hardwareSoftwareCount && attempts < hardwareSoftwareCount * 10) {
    const type = Math.random();
    let text, category;
    
    if (type < 0.4) { // 40% чисто hardware
      const base = rand(hardwareSoftwareDistinguishers.hardware);
      text = enhanceText(base);
      category = "hardware";
    } else if (type < 0.8) { // 40% чисто software
      const base = rand(hardwareSoftwareDistinguishers.software);
      text = enhanceText(base);
      category = "software";
    } else { // 20% смешанные (сложные кейсы)
      const base = rand(hardwareSoftwareDistinguishers.ambiguous);
      text = enhanceText(base);
      // Для смешанных случаев выбираем случайную категорию (обучение на сложных примерах)
      category = Math.random() > 0.5 ? "hardware" : "software";
    }
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, category);
      generated++;
    }
    attempts++;
  }
  
  // 5. КРОСС-КАТЕГОРИЙНЫЕ
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
  
  // 6. ШУМ И НЕЙТРАЛЬНЫЕ
  generated = 0;
  attempts = 0;
  while (generated < noiseCount && attempts < noiseCount * 10) {
    const noise = rand(noiseQueries);
    let category = noise.category;
    
    if (category === null) {
      if (Math.random() > 0.5) continue;
      category = rand(keys);
    }
    
    let text = enhanceText(noise.text);
    
    if (!uniqueMap.has(text)) {
      uniqueMap.set(text, category);
      generated++;
    }
    attempts++;
  }
  
  // 7. РАЗМЫТЫЕ ГРАНИЦЫ
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
  
  // 8. REAL-STYLE
  generated = 0;
  attempts = 0;
  const realKeys = Object.keys(realUserQueries);
  while (generated < realCount && attempts < realCount * 10) {
    const category = rand(realKeys);
    const complaints = realUserQueries[category];
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
console.log("🚀 Запуск генерации ДАТАСЕТА С ФОКУСОМ НА ПРОБЛЕМНЫЕ КАТЕГОРИИ...\n");
console.time("total_generation");

const dataset = generateEnhancedDataset(12000); // 12к записей

console.timeEnd("total_generation");

console.log(`\n✅ Уникальных записей: ${dataset.length}`);

// Статистика по категориям
const stats = {};
dataset.forEach(item => {
  stats[item.label] = (stats[item.label] || 0) + 1;
});

console.log("\n📊 НОВОЕ РАСПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯМ:");
Object.entries(stats).sort().forEach(([cat, count]) => {
  const percent = ((count / dataset.length) * 100).toFixed(1);
  let emoji = "";
  if (cat === "security") emoji = "🔐 ";
  if (cat === "network") emoji = "🌐 ";
  if (cat === "hardware") emoji = "🖥️ ";
  if (cat === "software") emoji = "📱 ";
  if (cat === "infrastructure") emoji = "🏗️ ";
  console.log(`   ${emoji}${cat.padEnd(15)}: ${count} (${percent}%)`);
});

// Показываем примеры новых категорий
console.log("\n📋 ПРИМЕРЫ НОВЫХ ОБРАЩЕНИЙ (SECURITY):");
const securityExamples = dataset.filter(d => d.label === "security").slice(0, 5);
securityExamples.forEach((ex, i) => {
  console.log(`   ${i+1}. ${ex.text.substring(0, 100)}`);
});

console.log("\n📋 ПРИМЕРЫ НОВЫХ ОБРАЩЕНИЙ (NETWORK):");
const networkExamples = dataset.filter(d => d.label === "network").slice(0, 5);
networkExamples.forEach((ex, i) => {
  console.log(`   ${i+1}. ${ex.text.substring(0, 100)}`);
});

console.log("\n📋 ПРИМЕРЫ ДЛЯ РАЗДЕЛЕНИЯ HARDWARE VS SOFTWARE:");
const hwExamples = dataset.filter(d => d.label === "hardware" && 
  hardwareSoftwareDistinguishers.hardware.some(h => d.text.includes(h.substring(0, 20)))).slice(0, 3);
const swExamples = dataset.filter(d => d.label === "software" && 
  hardwareSoftwareDistinguishers.software.some(s => d.text.includes(s.substring(0, 20)))).slice(0, 3);

console.log("   🖥️ HARDWARE:");
hwExamples.forEach((ex, i) => console.log(`      ${i+1}. ${ex.text.substring(0, 80)}`));
console.log("   📱 SOFTWARE:");
swExamples.forEach((ex, i) => console.log(`      ${i+1}. ${ex.text.substring(0, 80)}`));

// Сохраняем в файл
console.time("💾 Запись файла");
fs.writeFileSync("dataset_improved.json", JSON.stringify(dataset, null, 0));
console.timeEnd("💾 Запись файла");

console.log(`\n✅ Датасет сохранён: dataset_improved.json`);
console.log(`📊 Всего записей: ${dataset.length}`);