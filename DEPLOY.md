# Инструкция по развертыванию бота на Cloudflare Workers

## Предварительные требования

1. Аккаунт Cloudflare (бесплатный)
2. Node.js и npm установлены на вашем компьютере
3. Токен бота от @BotFather в Telegram
4. GitHub репозиторий (опционально, для автоматического деплоя)

## Шаг 1: Установка Wrangler CLI

```bash
npm install -g wrangler
```

Или используйте локальную установку:
```bash
npm install
```

## Шаг 2: Авторизация в Cloudflare

```bash
wrangler login
```

Откроется браузер, где нужно авторизоваться через Cloudflare.

## Шаг 3: Создание KV Namespace для конфигураций

Создайте KV namespace для хранения конфигурационных файлов (рейтинги, опросы):

```bash
# Создание production namespace
wrangler kv:namespace create "CONFIG"

# Создание preview namespace (для тестирования)
wrangler kv:namespace create "CONFIG" --preview
```

Скопируйте полученные ID и добавьте их в `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CONFIG"
id = "ваш-production-id"
preview_id = "ваш-preview-id"
```

## Шаг 4: Настройка секретов

Установите секретные переменные окружения:

```bash
# Токен бота (обязательно)
wrangler secret put BOT_TOKEN
# Введите токен бота от @BotFather

# ID владельца бота (опционально, для команды /restart)
wrangler secret put BOT_OWNER_ID
# Введите ваш Telegram user ID (можно узнать у @userinfobot)
```

## Шаг 5: Загрузка конфигураций в KV

Загрузите начальные данные в KV storage:

```bash
# Загрузка рейтингов
wrangler kv:key put "ratings" --path config/ratings.json

# Загрузка еженедельного опроса
wrangler kv:key put "weekly_poll" --path config/weekly_poll.json
```

Или создайте файлы вручную:

**config/ratings.json:**
```json
{
  "specialty_code": "09.02.07",
  "specialty_name": "Информационные системы и программирование",
  "groups": [
    {"name": "СИП-113/25", "place": 1, "score": 0},
    {"name": "СИП-123/25", "place": 2, "score": 0},
    {"name": "СИП-133/25", "place": 3, "score": 0},
    {"name": "СИП-143/25", "place": 4, "score": 0}
  ],
  "updated": ""
}
```

**config/weekly_poll.json:**
```json
{
  "url": "https://forms.yandex.ru/u/68ba8dd7d04688778fbd630a",
  "description": "Еженедельный опрос КСТ",
  "updated": ""
}
```

Затем загрузите:
```bash
wrangler kv:key put "ratings" --path config/ratings.json
wrangler kv:key put "weekly_poll" --path config/weekly_poll.json
```

## Шаг 6: Локальное тестирование

Запустите бота локально для тестирования:

```bash
npm run dev
# или
wrangler dev
```

## Шаг 7: Деплой на Cloudflare Workers

```bash
npm run deploy
# или
wrangler deploy
```

После деплоя вы получите URL вида: `https://kst-telegram-bot.your-subdomain.workers.dev`

## Шаг 8: Настройка Webhook в Telegram

После деплоя нужно настроить webhook, чтобы Telegram отправлял обновления на ваш Worker:

```bash
# Замените YOUR_WORKER_URL на ваш URL от Cloudflare
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://kst-telegram-bot.your-subdomain.workers.dev"
```

Или используйте браузер:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://kst-telegram-bot.your-subdomain.workers.dev
```

Проверьте, что webhook установлен:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## Шаг 9: Подключение GitHub репозитория (опционально)

1. В Cloudflare Dashboard перейдите в Workers & Pages
2. Выберите ваш Worker
3. Перейдите в Settings -> Triggers
4. Добавьте GitHub репозиторий для автоматического деплоя при push

## Обновление конфигураций

Для обновления рейтингов или опросов:

```bash
# Обновите файл config/ratings.json
# Затем загрузите в KV:
wrangler kv:key put "ratings" --path config/ratings.json

# Или напрямую через JSON:
wrangler kv:key put "ratings" --value '{"specialty_code": "09.02.07", ...}'
```

## Просмотр логов

```bash
wrangler tail
```

## Устранение неполадок

### Бот не отвечает
1. Проверьте, что webhook установлен: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Проверьте логи: `wrangler tail`
3. Убедитесь, что секреты установлены: `wrangler secret list`

### Ошибки KV
1. Убедитесь, что KV namespace создан и добавлен в `wrangler.toml`
2. Проверьте, что данные загружены: `wrangler kv:key get "ratings"`

### Ошибки деплоя
1. Проверьте синтаксис JavaScript в `src/index.js`
2. Убедитесь, что все зависимости установлены
3. Проверьте логи деплоя в консоли

## Полезные команды

```bash
# Просмотр всех секретов
wrangler secret list

# Удаление секрета
wrangler secret delete BOT_TOKEN

# Просмотр KV ключей
wrangler kv:key list

# Удаление KV ключа
wrangler kv:key delete "ratings"
```

## Отличия от polling версии

- Бот работает через webhooks, а не polling
- Конфигурации хранятся в Cloudflare KV, а не в файлах
- Нет доступа к файловой системе (изображения нужно хранить в R2 или CDN)
- Все запросы обрабатываются асинхронно

## Стоимость

Cloudflare Workers бесплатный план включает:
- 100,000 запросов в день
- 10ms CPU time на запрос
- 1 KV namespace с 100,000 операций чтения/дня

Этого достаточно для небольшого-среднего бота.

