// Telegram Bot для Cloudflare Workers
// Работает через Webhooks вместо polling

// Константы
const ANNOUNCEMENTS_CHANNEL_LINK = "https://t.me/kst_announcements";
const ANNOUNCEMENTS_CHANNEL_USERNAME = "@KST ANNOUNCEMENTS";
const NEWS_FEED_CHANNEL_LINK = "https://t.me/kst_abiturient_news";
const NEWS_FEED_CHANNEL_USERNAME = "@KST_ABITURIENTS_NEWS";
const CHAT_LINK = "https://t.me/+-7B5mbs8eOo2YmJi";

// Категории предсказаний
const PREDICTION_CATEGORIES = {
    "учеба": [
        "Сегодня ты получишь неожиданную '5' на паре",
        "Преподаватель задаст вопрос, на который только ты знаешь ответ",
        "Твоя домашняя работа окажется самой лучшей в группе",
        "На контрольной попадется именно тот билет, который ты повторил",
        "Сокурсник попросит у тебя помощи с заданием",
        "Ты откроешь новый эффективный способ конспектирования",
        "Лекция окажется намного интереснее, чем ты ожидал",
        "Ты найдешь ошибку в учебнике и получишь за это благодарность"
    ],
    "отношения": [
        "Ты встретишь старого друга из другой группы",
        "Кто-то из одногруппников сделает тебе неожиданный комплимент",
        "Ты помиришься с тем, с кем давно был в ссоре",
        "На перемене заведешь интересный разговор с новым человеком",
        "Тебе признаются в уважении, о котором ты не подозревал",
        "Коллега по учебе пригласит тебя на совместный проект"
    ],
    "удача": [
        "Ты найдешь потерянную вещь, которую давно искал",
        "На столовой тебе достанется последний пирожок",
        "Автобус приедет именно тогда, когда ты подойдешь к остановке",
        "Ты выиграешь в студенческой лотерее",
        "Тебе уступят место в переполненной аудитории",
        "Найдешь деньги в старой куртке"
    ],
    "творчество": [
        "К тебе придет гениальная идея для проекта",
        "Ты неожиданно проявишь талант в том, чего раньше не пробовал",
        "Твое творческое решение удивит даже преподавателя",
        "Ты найдешь вдохновение в самом неожиданном месте",
        "Сокурсники оценят твою креативность"
    ],
    "здоровье": [
        "Ты откроешь для себя новый полезный перекус в столовой",
        "Пробежка между корпусами зарядит тебя энергией на весь день",
        "Ты найдешь идеальное место для отдыха между парами",
        "Откроешь новый способ снять стресс перед экзаменом"
    ],
    "финансы": [
        "Тебе неожиданно вернут старый долг",
        "Найдешь способ сэкономить на обедах",
        "Получишь выгодное предложение о подработке",
        "Тебе сделают скидку в студенческой столовой"
    ],
    "студенческая жизнь": [
        "Тебя пригласят на интересное мероприятие в колледже",
        "Узнаешь секретное место в общежитии",
        "Станешь свидетелем забавной ситуации в коридоре",
        "Участвуешь в спонтанной студенческой акции"
    ],
    "будущее": [
        "Сегодняшний день повлияет на твою будущую профессию",
        "Ты получишь знак, который поможет в выборе специализации",
        "Встреча изменит твои планы на семестр",
        "Ты поймешь, каким путем хочешь развиваться дальше"
    ]
};

const STUDENT_TIPS = [
    "Не откладывай на завтра то, что можно сделать между парами",
    "Самая сложная пара — это первая, дальше будет легче",
    "Конспектируй не всё подряд, а только главное",
    "Лучший друг студента — это термос с кофе",
    "Не бойся задавать вопросы — чаще всего они у других тоже есть",
    "Перемена дана не для учебы, а для отдыха",
    "Сон важнее, чем доучивание ночью",
    "Работа в команде экономит время и силы"
];

const RANDOM_PREDICTIONS = [
    "Сегодня ты узнаешь что-то, что изменит твой взгляд на учебу",
    "В течение дня к тебе придет озарение по сложному предмету",
    "Ты неожиданно получишь помощь от того, от кого не ожидал",
    "Случайная встреча приведет к интересному разговору",
    "Ты найдешь решение проблемы, которая мучила тебя неделю",
    "Сегодняшний день принесет маленькую, но приятную победу",
    "Ты откроешь в себе новый талант",
    "Удача улыбнется тебе в самый неожиданный момент"
];

// Функции для работы с Telegram API
async function sendMessage(botToken, chatId, text, options = {}) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...options
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    return response.json();
}

async function editMessageText(botToken, chatId, messageId, text, options = {}) {
    const url = `https://api.telegram.org/bot${botToken}/editMessageText`;
    const payload = {
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        ...options
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    return response.json();
}

async function answerCallbackQuery(botToken, callbackQueryId, text = '') {
    const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
    const payload = {
        callback_query_id: callbackQueryId,
        text: text
    };
    
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

async function deleteMessage(botToken, chatId, messageId) {
    const url = `https://api.telegram.org/bot${botToken}/deleteMessage`;
    const payload = {
        chat_id: chatId,
        message_id: messageId
    };
    
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

async function sendPhoto(botToken, chatId, photoUrl, caption, options = {}) {
    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    const payload = {
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML',
        ...options
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    return response.json();
}

// Функции для клавиатур
function getMainMenuKeyboard() {
    return {
        keyboard: [
            [{ text: "ПЕДАГОГАМ" }, { text: "АБИТУРИЕНТАМ" }],
            [{ text: "СТУДЕНТАМ" }, { text: "О НАС" }]
        ],
        resize_keyboard: true,
        is_persistent: true
    };
}

function getMainMenuInline() {
    return {
        inline_keyboard: [
            [{ text: "ПЕДАГОГАМ", callback_data: 'pedagogam' }],
            [{ text: "АБИТУРИЕНТАМ", callback_data: 'abiturientam' }],
            [{ text: "СТУДЕНТАМ", callback_data: 'studentam' }],
            [{ text: "О НАС", callback_data: 'onas' }]
        ]
    };
}

function getPedagogamKeyboard() {
    return {
        inline_keyboard: [
            [{ text: "Опросы", callback_data: 'polls' }],
            [{ text: "◀️ Назад", callback_data: 'back_main' }]
        ]
    };
}

function getAbiturientamKeyboard() {
    return {
        inline_keyboard: [
            [{ text: "Чат", callback_data: 'chat' }],
            [{ text: "Часто задаваемые вопросы", callback_data: 'faq' }],
            [{ text: "Дни открытых дверей", callback_data: 'open_doors' }],
            [{ text: "◀️ Назад", callback_data: 'back_main' }]
        ]
    };
}

function getStudentamKeyboard() {
    return {
        inline_keyboard: [
            [{ text: "Чат", callback_data: 'chat' }],
            [{ text: "Рейтинги", callback_data: 'ratings' }],
            [{ text: "Сведения о семестрах", callback_data: 'semesters' }],
            [{ text: "🔮 Бот-предсказатель", callback_data: 'predictor' }],
            [{ text: "Еженедельный опрос", callback_data: 'weekly_poll' }],
            [{ text: "Расписание обедов", callback_data: 'lunch_schedule' }],
            [{ text: "◀️ Назад", callback_data: 'back_main' }]
        ]
    };
}

function getOnasKeyboard() {
    return {
        inline_keyboard: [
            [{ text: "Партнёры-работодатели", callback_data: 'partners' }],
            [{ text: "Новости", callback_data: 'news' }],
            [{ text: "◀️ Назад", callback_data: 'back_main' }]
        ]
    };
}

function getPredictionKeyboard() {
    return {
        inline_keyboard: [
            [{ text: "🎯 Получить предсказание на сегодня", callback_data: 'get_prediction' }],
            [{ text: "📊 Статистика предсказаний", callback_data: 'prediction_stats' }],
            [{ text: "❓ Как работает предсказатель?", callback_data: 'how_predictor_works' }],
            [{ text: "◀️ Назад к студентам", callback_data: 'studentam' }]
        ]
    };
}

// Функции для предсказаний
function getDailyPrediction(userId) {
    const now = new Date();
    const seed = userId + now.getDate() + now.getMonth() * 100;
    
    // Простой генератор псевдослучайных чисел
    let seedValue = seed;
    function random() {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
    }
    
    const categories = Object.keys(PREDICTION_CATEGORIES);
    const category = categories[Math.floor(random() * categories.length)];
    const predictions = PREDICTION_CATEGORIES[category];
    const prediction = predictions[Math.floor(random() * predictions.length)];
    
    let result = `🎓 <b>Предсказание на сегодня (${category.charAt(0).toUpperCase() + category.slice(1)}):</b>\n\n${prediction}`;
    
    if (random() < 0.3) {
        const tip = STUDENT_TIPS[Math.floor(random() * STUDENT_TIPS.length)];
        result += `\n\n💡 <b>Совет дня:</b>\n${tip}`;
    } else if (random() < 0.2) {
        const extraPrediction = RANDOM_PREDICTIONS[Math.floor(random() * RANDOM_PREDICTIONS.length)];
        result += `\n\n✨ <b>Бонус-предсказание:</b>\n${extraPrediction}`;
    }
    
    return result;
}

// Функции для загрузки конфигураций из KV
async function loadRatings(CONFIG) {
    if (!CONFIG) {
        // Если KV не настроен, возвращаем значения по умолчанию
        return {
            specialty_code: "09.02.07",
            specialty_name: "Информационные системы и программирование",
            groups: [
                { name: "СИП-113/25", place: 1, score: 0 },
                { name: "СИП-123/25", place: 2, score: 0 },
                { name: "СИП-133/25", place: 3, score: 0 },
                { name: "СИП-143/25", place: 4, score: 0 }
            ],
            updated: ""
        };
    }
    
    try {
        const data = await CONFIG.get('ratings');
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading ratings:', e);
    }
    
    return {
        specialty_code: "09.02.07",
        specialty_name: "Информационные системы и программирование",
        groups: [
            { name: "СИП-113/25", place: 1, score: 0 },
            { name: "СИП-123/25", place: 2, score: 0 },
            { name: "СИП-133/25", place: 3, score: 0 },
            { name: "СИП-143/25", place: 4, score: 0 }
        ],
        updated: ""
    };
}

async function loadWeeklyPoll(CONFIG) {
    if (!CONFIG) {
        // Если KV не настроен, возвращаем значения по умолчанию
        return {
            url: "https://forms.yandex.ru/u/68ba8dd7d04688778fbd630a",
            description: "Еженедельный опрос КСТ",
            updated: ""
        };
    }
    
    try {
        const data = await CONFIG.get('weekly_poll');
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading weekly poll:', e);
    }
    
    return {
        url: "https://forms.yandex.ru/u/68ba8dd7d04688778fbd630a",
        description: "Еженедельный опрос КСТ",
        updated: ""
    };
}

// Обработчики команд
async function handleStart(update, botToken) {
    const user = update.message.from;
    const welcomeText = `👋 Привет, ${user.first_name}!\n\nДобро пожаловать в <b>КСТ ⚡️</b>!\nВыберите раздел в меню:`;
    
    await sendMessage(botToken, update.message.chat.id, welcomeText, {
        reply_markup: getMainMenuKeyboard()
    });
}

async function handleMenu(update, botToken) {
    await sendMessage(botToken, update.message.chat.id, "📱 <b>КСТ ⚡️</b>\nВыберите раздел:", {
        reply_markup: getMainMenuKeyboard()
    });
}

async function handleRestart(update, botToken, ownerId) {
    const user = update.message.from;
    const userId = user.id;
    
    if (ownerId && userId !== ownerId) {
        await sendMessage(botToken, update.message.chat.id, "⛔️ Команда /restart доступна только администратору.");
        return;
    }
    
    await sendMessage(botToken, update.message.chat.id, "🔄 ПЕРЕЗАГРУЖАЮ БОТА...");
    
    try {
        await deleteMessage(botToken, update.message.chat.id, update.message.message_id);
    } catch (e) {
        // Игнорируем ошибки удаления
    }
    
    const name = user.first_name || "друг";
    const welcomeText = `👋 Привет, ${name}!\n\nДобро пожаловать в <b>КСТ ⚡️</b>!\nВыберите раздел в меню:`;
    
    await sendMessage(botToken, update.message.chat.id, welcomeText, {
        reply_markup: getMainMenuKeyboard()
    });
}

async function handleHelp(update, botToken) {
    const helpText = `<b>📋 Доступные команды:</b>\n\n/start — Запустить бота\n/restart — Перезапустить бота\n/menu — Главное меню\n/help — Эта справка\n/about — О проекте\n/announcements — Посмотреть объявления\n/newsfeed — Лента новостей для абитуриентов\n/predictor — Получить предсказание на день\n\n<b>📞 Поддержка:</b>\nПо вопросам работы бота обращайтесь к администраторам.`;
    
    await sendMessage(botToken, update.message.chat.id, helpText);
}

async function handleAbout(update, botToken) {
    const aboutText = `<b>🤖 КСТ ⚡️</b>\n\nБот колледжа с информацией для педагогов, абитуриентов и студентов.\n\n📚 <b>Разделы:</b>\n• ПЕДАГОГАМ — опросы\n• АБИТУРИЕНТАМ — чат, часто задаваемые вопросы\n• СТУДЕНТАМ — чат, рейтинги, сведения о семестрах, бот-предсказатель, еженедельный опрос, расписание обедов\n• О НАС — справка, контингент, партнёры, новости\n\n💡 Бот постоянно развивается!`;
    
    await sendMessage(botToken, update.message.chat.id, aboutText);
}

async function handleAnnouncements(update, botToken) {
    const announcementText = `📢 <b>ОБЪЯВЛЕНИЯ КСТ</b>\n\nВсе официальные объявления публикуются в канале:\n${ANNOUNCEMENTS_CHANNEL_USERNAME}\n\n<i>Только администрация может публиковать сообщения в этом канале.</i>`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: "📢 Перейти в канал объявлений", url: ANNOUNCEMENTS_CHANNEL_LINK }],
            [{ text: "◀️ Главное меню", callback_data: 'back_main' }]
        ]
    };
    
    await sendMessage(botToken, update.message.chat.id, announcementText, { reply_markup: keyboard });
}

async function handleNewsfeed(update, botToken) {
    const newsfeedText = `📰 <b>ПЕРСОНАЛЬНАЯ ЛЕНТА НОВОСТЕЙ</b>\n\nСпециальный канал для абитуриентов с актуальной информацией:\n\n• Важные даты и сроки\n• Изменения в правилах приема\n• Мероприятия и дни открытых дверей\n• Советы по подготовке\n• Ответы на частые вопросы\n\nПодпишитесь на канал:\n${NEWS_FEED_CHANNEL_USERNAME}`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: "📰 Подписаться на новости", url: NEWS_FEED_CHANNEL_LINK }],
            [{ text: "◀️ Главное меню", callback_data: 'back_main' }]
        ]
    };
    
    await sendMessage(botToken, update.message.chat.id, newsfeedText, { reply_markup: keyboard });
}

async function handlePredictor(update, botToken) {
    const user = update.message.from;
    const predictorText = `🔮 <b>Бот-предсказатель КСТ</b>\n\nПривет, ${user.first_name}! Я знаю, что ждет тебя сегодня в колледже!\n\nМои предсказания основаны на:\n• Твоем уникальном ID\n• Текущей дате\n• Секретной студенческой мудрости\n\n<i>Помни: предсказания — это шутка и способ поднять настроение! 😉</i>`;
    
    await sendMessage(botToken, update.message.chat.id, predictorText, {
        reply_markup: getPredictionKeyboard()
    });
}

// Обработчик текстовых сообщений
function getReplyForMenuButton(text) {
    const menus = {
        "ПЕДАГОГАМ": ["<b>ПЕДАГОГАМ</b>\nВыберите раздел:", getPedagogamKeyboard()],
        "АБИТУРИЕНТАМ": ["<b>АБИТУРИЕНТАМ</b>\nВыберите раздел:", getAbiturientamKeyboard()],
        "СТУДЕНТАМ": ["<b>СТУДЕНТАМ</b>\nВыберите раздел:", getStudentamKeyboard()],
        "О НАС": ["<b>О НАС</b>\nВыберите раздел:", getOnasKeyboard()]
    };
    return menus[text];
}

async function handleMessage(update, botToken) {
    const text = update.message.text || "";
    const lowerText = text.toLowerCase();
    
    if (['меню', 'menu', 'начать', 'кст'].includes(lowerText)) {
        await handleMenu(update, botToken);
    } else if (['объявления', 'announcements', 'новости'].includes(lowerText)) {
        await handleAnnouncements(update, botToken);
    } else if (['лента новостей', 'новости абитуриентов', 'newsfeed'].includes(lowerText)) {
        await handleNewsfeed(update, botToken);
    } else if (['предсказание', 'предсказатель', 'predictor', 'гадание'].includes(lowerText)) {
        await handlePredictor(update, botToken);
    } else {
        const result = getReplyForMenuButton(text);
        if (result) {
            const [msgText, inlineKb] = result;
            await sendMessage(botToken, update.message.chat.id, msgText, {
                reply_markup: inlineKb
            });
        } else {
            await sendMessage(botToken, update.message.chat.id, "Выберите раздел в меню КСТ ⚡️ или команду /menu.", {
                reply_markup: getMainMenuKeyboard()
            });
        }
    }
}

// Обработчик callback query (кнопки)
async function handleCallbackQuery(update, botToken, CONFIG) {
    const query = update.callback_query;
    await answerCallbackQuery(botToken, query.id);
    
    const data = query.data;
    const userId = query.from.id;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    
    let text = "";
    let replyMarkup = null;
    
    if (data === 'back_main') {
        text = "📱 <b>КСТ ⚡️</b>\nВыберите раздел:";
        replyMarkup = getMainMenuInline();
    } else if (data === 'pedagogam') {
        text = "<b>ПЕДАГОГАМ</b>\nВыберите раздел:";
        replyMarkup = getPedagogamKeyboard();
    } else if (data === 'abiturientam') {
        text = "<b>АБИТУРИЕНТАМ</b>\nВыберите раздел:";
        replyMarkup = getAbiturientamKeyboard();
    } else if (data === 'studentam') {
        text = "<b>СТУДЕНТАМ</b>\nВыберите раздел:";
        replyMarkup = getStudentamKeyboard();
    } else if (data === 'onas') {
        text = "<b>О НАС</b>\nВыберите раздел:";
        replyMarkup = getOnasKeyboard();
    } else if (data === 'chat') {
        text = `💬 <b>Чат КСТ</b>\n\nПрисоединяйтесь к общему чату колледжа, чтобы общаться с другими студентами и получать актуальную информацию.`;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "Открыть чат КСТ 💬", url: CHAT_LINK }],
                [{ text: "◀️ Назад", callback_data: 'back_main' }]
            ]
        };
    } else if (data === 'predictor') {
        text = `🔮 <b>Бот-предсказатель КСТ</b>\n\nПривет, ${query.from.first_name}! Я предсказываю будущее студентов!\n\n<b>Что я умею:</b>\n• Давать персональные предсказания на день\n• Предсказывать успехи в учебе\n• Находить скрытые таланты\n• Предвидеть удачные моменты\n\n<i>Важно: это шуточный бот для поднятия настроения! 😊</i>`;
        replyMarkup = getPredictionKeyboard();
    } else if (data === 'get_prediction') {
        const prediction = getDailyPrediction(userId);
        const emojis = ["✨", "🌟", "💫", "⭐️", "🎯", "🔮", "🎓", "📚"];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        text = `${emoji} <b>ТВОЕ ПРЕДСКАЗАНИЕ:</b>\n\n${prediction}\n\n<i>Предсказание обновляется раз в день!</i>`;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "🔄 Обновить предсказание", callback_data: 'get_prediction' }],
                [{ text: "📊 Статистика", callback_data: 'prediction_stats' }],
                [{ text: "◀️ Назад к предсказателю", callback_data: 'predictor' }]
            ]
        };
    } else if (data === 'prediction_stats') {
        text = `📊 <b>СТАТИСТИКА ПРЕДСКАЗАНИЙ</b>\n\n<b>Всего предсказаний:</b> ${Math.floor(Math.random() * 4000) + 1000}\n<b>Самые популярные категории:</b>\n1. Учеба — 34%\n2. Отношения — 22%\n3. Удача — 18%\n4. Творчество — 16%\n5. Остальные — 10%\n\n<b>Точность предсказаний:</b>\n• Сбываются в течение дня — 68%\n• Сбываются в течение недели — 89%\n• Не сбываются — 11%\n\n<i>*Статистика собирается анонимно и используется для улучшения бота</i>`;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "🎯 Получить предсказание", callback_data: 'get_prediction' }],
                [{ text: "◀️ Назад к предсказателю", callback_data: 'predictor' }]
            ]
        };
    } else if (data === 'how_predictor_works') {
        const totalPredictions = Object.values(PREDICTION_CATEGORIES).reduce((sum, arr) => sum + arr.length, 0);
        text = `🤖 <b>КАК РАБОТАЕТ ПРЕДСКАЗАТЕЛЬ?</b>\n\n<b>Алгоритм работы:</b>\n1. Берется ваш уникальный ID в Telegram\n2. Добавляется текущая дата\n3. Создается уникальный 'сид' для генерации\n4. Выбирается случайная категория предсказаний\n5. Генерируется персональное предсказание\n\n<b>База данных:</b>\n• ${Object.keys(PREDICTION_CATEGORIES).length} категорий\n• ${totalPredictions} предсказаний\n• ${STUDENT_TIPS.length} советов для студентов\n• ${RANDOM_PREDICTIONS.length} случайных предсказаний\n\n<b>Важно:</b>\nЭто развлекательный бот! Не принимайте предсказания слишком серьезно.\n\n<i>Разработано с юмором и заботой о студентах КСТ! 😄</i>`;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "🎯 Попробовать предсказание", callback_data: 'get_prediction' }],
                [{ text: "◀️ Назад к предсказателю", callback_data: 'predictor' }]
            ]
        };
    } else if (data === 'weekly_poll') {
        const pollCfg = await loadWeeklyPoll(CONFIG);
        const url = pollCfg.url || "https://forms.yandex.ru/u/68ba8dd7d04688778fbd630a";
        const desc = pollCfg.description || "Еженедельный опрос КСТ";
        const updated = pollCfg.updated || "";
        
        let pollText = `📊 <b>ЕЖЕНЕДЕЛЬНЫЙ ОПРОС</b>\n\n${desc}\n\nПерейдите по ссылке ниже, чтобы пройти опрос. Ссылка обновляется еженедельно.\n\n`;
        if (updated) {
            pollText += `<i>Обновлено: ${updated}</i>`;
        }
        
        text = pollText;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "📋 Пройти опрос", url: url }],
                [{ text: "◀️ Назад к студентам", callback_data: 'studentam' }]
            ]
        };
    } else if (data === 'lunch_schedule') {
        text = "🍽️ <b>Распределение групп на обед</b>\n\nАктуальное расписание обедов по группам. Информация обновляется еженедельно.\n\n<i>Чтобы отобразить фото расписания, загрузите изображение в Cloudflare R2 или другой CDN и обновите код.</i>";
        replyMarkup = {
            inline_keyboard: [
                [{ text: "◀️ Назад к студентам", callback_data: 'studentam' }]
            ]
        };
    } else if (data === 'news') {
        text = `<b>📰 НОВОСТИ КСТ</b>\n\n<b>ГБПОУ КСТ</b>\nГосударственное бюджетное профессиональное образовательное учреждение города Москвы "Колледж современных технологий имени Героя Советского Союза М.Ф. Панова"\n\n• На Дне добровольца прошла большая встреча волонтеров — «В ритме добра», где студенты КСТ тоже побывали — и ушли не с пустыми руками!\nКроме подведения итогов и интерактивов, прошло награждение самых активных участников за год.\nИ есть новость, которой особенно хочется похвастаться:\nСтудент 2 курса специальности «Информационные системы и программирование» Михаил Кудрин получил знак отличия за активность в добровольческих мероприятиях!\n\n• Победа в финале Спартакиады «Моспром» по киберспортивным направлениям. Студенты КСТ заняли 1-е место в игре FIFA (2 на 2) и 2-е место в игре Dota 2 (5 на 5).\n\n• Участие студентов кафедры Промышленности и инженерных технологий в Международном чемпионате по аддитивным технологиям «3D ПРОФИ».\n\n• Серебро команды студентов кафедры «Бизнес-технологии» на V Всероссийском кейс-чемпионате по бизнес-решениям в Московском Политехе.\n\n• Участие спортивного клуба «по_КраСоТе» в Студенческой спортивной лиге по волейболу среди колледжей Москвы.\n\n• Победа трёх преподавателей иностранных языков в диагностике Московского центра качества образования, они получили высший балл — уровень «эксперт».\n\n• Участие студентов КСТ в ХI Московском чемпионате профессионального мастерства «Абилимпикс» — 2025.`;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "◀️ Назад к О НАС", callback_data: 'onas' }]
            ]
        };
    } else if (data === 'partners') {
        text = `<b>👔 ПАРТНЁРЫ-РАБОТОДАТЕЛИ</b>\n\n<b>09.02.07</b> — «Информационные системы и программирование»:\n\n• ПАО МГТС\n• ООО «НИЦ ЦТ»\n• ГБПОУ КСТ, ГБУ СППМ\n• ФГУП «18 ЦНИИ» МО РФ\n• ООО ТПК «Аргус-НВ»\n• ООО Техцентр «ЛУКОМ-А»\n• Федеральная служба по финансовому мониторингу`;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "◀️ Назад к О НАС", callback_data: 'onas' }]
            ]
        };
    } else if (data === 'ratings') {
        const dataRatings = await loadRatings(CONFIG);
        const code = dataRatings.specialty_code || "09.02.07";
        const name = dataRatings.specialty_name || "Информационные системы и программирование";
        const groups = dataRatings.groups || [];
        const updated = dataRatings.updated || "";
        
        let lines = [`<b>📊 РЕЙТИНГ ГРУПП</b>\n\n<b>${code}</b> — ${name}\n`];
        const sortedGroups = [...groups].sort((a, b) => (a.place || 99) - (b.place || 99));
        sortedGroups.forEach((g, i) => {
            const groupName = g.name || "";
            const score = g.score || "";
            lines.push(`${i + 1}. ${groupName}` + (score ? ` — ${score}` : ""));
        });
        if (updated) {
            lines.push(`\n<i>Обновлено: ${updated}</i>`);
        }
        lines.push("\n<i>Рейтинг можно изменить через KV storage в Cloudflare</i>");
        
        text = lines.join("\n");
        replyMarkup = {
            inline_keyboard: [
                [{ text: "◀️ Назад к студентам", callback_data: 'studentam' }]
            ]
        };
    } else if (data === 'polls') {
        text = `<b>📋 ОПРОСЫ ДЛЯ ПЕДАГОГОВ</b>\n\nЗдесь вы можете создавать и проводить опросы среди студентов и коллег.\n\n<b>Возможности:</b>\n• Создание опросов по учёбе и мероприятиям\n• Анонимные и именные опросы\n• Экспорт результатов\n\n<b>Как создать опрос:</b>\n1. Подготовьте список вопросов\n2. Выберите тип опроса (один ответ / несколько)\n3. Отправьте опрос в нужный чат или группу\n4. Соберите ответы и проанализируйте результаты\n\n<i>По вопросам создания опросов обращайтесь к администрации колледжа.</i>`;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "◀️ Назад к педагогам", callback_data: 'pedagogam' }]
            ]
        };
    } else if (data === 'open_doors') {
        text = `<b>🚪 ДНИ ОТКРЫТЫХ ДВЕРЕЙ</b>\n\nПриглашаем будущих абитуриентов и родителей на дни открытых дверей в КСТ!\n\n<b>Что вас ждёт:</b>\n• Знакомство с колледжем и специальностями\n• Экскурсии по аудиториям и мастерским\n• Встреча с преподавателями и студентами\n• Ответы на вопросы о поступлении и учёбе\n\n🗓 Актуальное расписание и формат проведения смотрите по ссылке ниже.\n\n<i>При необходимости уточняйте детали на сайте колледжа или по телефону приёмной комиссии.</i>`;
        replyMarkup = {
            inline_keyboard: [
                [{ text: "🌐 Дни открытых дверей", url: "https://school.mos.ru/mcrpo/portal/dod/#dod-list" }],
                [{ text: "◀️ Назад к абитуриентам", callback_data: 'abiturientam' }]
            ]
        };
    } else {
        // Заглушка для остальных разделов
        text = `<b>⚙️ Раздел в разработке</b>\n\n${data.replace(/_/g, ' ').toUpperCase()}\n\nСкоро здесь появится функционал!`;
        let backData = 'back_main';
        if (['semesters', 'ratings', 'weekly_poll', 'lunch_schedule'].includes(data)) {
            backData = 'studentam';
        } else if (data === 'polls') {
            backData = 'pedagogam';
        } else if (['faq', 'open_doors'].includes(data)) {
            backData = 'abiturientam';
        } else if (['partners', 'news'].includes(data)) {
            backData = 'onas';
        }
        replyMarkup = {
            inline_keyboard: [
                [{ text: "◀️ Назад", callback_data: backData }]
            ]
        };
    }
    
    await editMessageText(botToken, chatId, messageId, text, {
        reply_markup: replyMarkup
    });
}

// Главный обработчик
async function handleUpdate(update, env) {
    const botToken = env.BOT_TOKEN;
    const ownerId = env.BOT_OWNER_ID ? parseInt(env.BOT_OWNER_ID) : null;
    const CONFIG = env.CONFIG; // KV namespace
    
    if (update.message) {
        const text = update.message.text || "";
        
        if (text.startsWith('/start')) {
            await handleStart(update, botToken);
        } else if (text.startsWith('/menu')) {
            await handleMenu(update, botToken);
        } else if (text.startsWith('/restart')) {
            await handleRestart(update, botToken, ownerId);
        } else if (text.startsWith('/help')) {
            await handleHelp(update, botToken);
        } else if (text.startsWith('/about')) {
            await handleAbout(update, botToken);
        } else if (text.startsWith('/announcements')) {
            await handleAnnouncements(update, botToken);
        } else if (text.startsWith('/newsfeed')) {
            await handleNewsfeed(update, botToken);
        } else if (text.startsWith('/predictor')) {
            await handlePredictor(update, botToken);
        } else if (update.message.text) {
            await handleMessage(update, botToken);
        }
    } else if (update.callback_query) {
        await handleCallbackQuery(update, botToken, CONFIG);
    }
}

// Экспорт обработчика для Cloudflare Workers
export default {
    async fetch(request, env) {
        // Проверка метода
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }
        
        try {
            const update = await request.json();
            
            // Обрабатываем update асинхронно (не ждем ответа)
            handleUpdate(update, env).catch(err => {
                console.error('Error handling update:', err);
            });
            
            // Сразу возвращаем OK для Telegram
            return new Response('OK', { status: 200 });
        } catch (error) {
            console.error('Error processing request:', error);
            return new Response('Error', { status: 500 });
        }
    }
};

