const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const token = '1735480866:AAFsqEUW3My4QL0Ks66Ln0cOyRd4xALl288'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async chatId => {
    await bot.sendMessage(chatId, 'Я загадаю цифру, а ты угадай 0-9')
    const randomNumber = Math.floor(Math.random() * 4)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, 'отгадывай!', gameOptions)
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},
        {command: '/info', description: 'ваше имя'},
        {command: '/game', description: 'игра угадай число'}
    ])

    bot.on('message', async (message) => {
        const text = message.text
        const chatId = message.chat.id
        console.log(message)
        if(text === '/start'){
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/cbe/e09/cbee092b-2911-4290-b015-f8eb4f6c7ec4/12.webp')
            return  bot.sendMessage(chatId, 'Добро пожаловать в мой бот')
        }
        if(text === '/game') {
            return startGame(chatId)
        }
        if(text === '/info') {
            return  bot.sendMessage(chatId, `я знаю твоё имя - ${message.from.first_name}`)
        }

        return bot.sendMessage(chatId, `Я тебя не понимаю, ${message.from.first_name}`)
    })
    bot.on('callback_query', async message => {
        console.log(message)
        const data = message.data
        const chatId = message.message.chat.id

        if(data === '/again') {
            return startGame(chatId)
        }
        if(data == chats[chatId]) {
            return await bot.sendMessage(chatId, 'Поздравляю, ты угадал цифру', againOptions)
        }else {
            return await bot.sendMessage(chatId, 'неверно , это было ' + chats[chatId], againOptions)
        }
    })
}

start()