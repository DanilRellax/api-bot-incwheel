const axios = require('axios'); // Модуль для запросов к серверу.
const { VK } = require('vk-io'); // Модуль для работы бота.
const payment = require('./payment/payment.json');

// Подключение к API серверу
let userId = 0
let userKey = ''

// Токен группы, для полноценной работы бота.
let group_token = ''

const bot = new VK({ token: group_token });

// Проверка баланса любого человека (по умолчанию стоит ваш id).
async function get_balance(id) {
    let { data } = await axios.post('http://dan-app.space:3000/api/get_balance', {
        user_id: id
    });
    return data.response.balance;
}

// Вывод коинов.
async function send_coin() {
    let { data } = await axios.post('http://dan-app.space:3000/api/send_coins', {
        sender_id: userId,
        key: userKey,
        amount: 100,
        recepiend_id: 198700932
    });
    return data;
}

bot.updates.on('message', async(context) => {
    if(context.senderId < 1) return;
    // Проверка баланса
    if(context.text == 'Бал') {
        let balance = await get_balance(context.senderId);
        return context.send(`Ваш баланс: ${balance} IC!`)
    }
    if(context.text == 'Пополнить') {
        return context.send(`Для пополнение коинов перейдите сюда: https://vk.me/incwheel\n\nИ переведите этому аккаунту: https://vk.com/id${context.senderId} любую сумму.`)
    }
    if(context.text == 'Вывод') {
        let res = await send_coin();
        await console.log(res)
        return context.send(`Проверьте статус вывода в консоле.`)
    }
});

setInterval(async() => {
    let { data } = await axios.post('http://dan-app.space:3000/api/payments', {
        user_id: userId,
        key: userKey
    });
    data.forEach(res => {
        var _pay = data.find(x => x.id == res.id);
        if(!payment[_pay.id]) {
            payment[_pay.id] = {
                id: _pay.id,
                sender_id: _pay.sender_id,
                recepiend_id: _pay.recepiend_id,
                amount: _pay.amount,
                create_date: _pay.create_date
            }
            bot.api.messages.send({
                user_id: _pay.sender_id,
                message: `🚀 Вы пополнили баланс на ${_pay.amount} коинов.`,
                random_id: Date.now()
            })
        }
    });
}, 2345);

setInterval(() => {
    require('fs').writeFileSync(`./payment/payment.json`, JSON.stringify(payment, null, "\t"));
}, 1000);

bot.updates.start(console.log(`Скрипт запущен!`)).catch((e) => { 
    console.log(`При запуске скрипта, произошла ошибка:\n${e}`)
});

process.on("uncaughtException", e => {
	console.log(e);
});
