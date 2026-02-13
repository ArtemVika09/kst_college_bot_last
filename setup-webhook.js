// Скрипт для настройки webhook в Telegram
// Использование: node setup-webhook.js <BOT_TOKEN> <WEBHOOK_URL>

const [,, botToken, webhookUrl] = process.argv;

if (!botToken || !webhookUrl) {
    console.error('Использование: node setup-webhook.js <BOT_TOKEN> <WEBHOOK_URL>');
    console.error('Пример: node setup-webhook.js 123456:ABC-DEF https://your-worker.workers.dev');
    process.exit(1);
}

async function setWebhook() {
    try {
        const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ Webhook успешно установлен!');
            console.log(`URL: ${webhookUrl}`);
        } else {
            console.error('❌ Ошибка установки webhook:', data.description);
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

async function getWebhookInfo() {
    try {
        const url = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok) {
            console.log('\n📊 Информация о webhook:');
            console.log(JSON.stringify(data.result, null, 2));
        }
    } catch (error) {
        console.error('❌ Ошибка получения информации:', error.message);
    }
}

async function main() {
    await setWebhook();
    await getWebhookInfo();
}

main();

