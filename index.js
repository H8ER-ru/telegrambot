const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')
const token = '1735480866:AAFsqEUW3My4QL0Ks66Ln0cOyRd4xALl288'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async chatId => {
    await bot.sendMessage(chatId, 'Я загадаю цифру, а ты угадай 0-9')
    const randomNumber = Math.floor(Math.random() * 4)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, 'отгадывай!', gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    }catch (e) {
        console.log('Подключение к бд сломалось')
        console.log(e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},
        {command: '/info', description: 'ваше имя'},
        {command: '/game', description: 'игра угадай число'}
    ])

    bot.on('message', async (message) => {
        const text = message.text
        const chatId = message.chat.id
        console.log(message)

        try {
            if(text === '/start'){
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/cbe/e09/cbee092b-2911-4290-b015-f8eb4f6c7ec4/12.webp')
                return  bot.sendMessage(chatId, 'Добро пожаловать в мой бот')
            }
            if(text === '/game') {
                return startGame(chatId)
            }
            if(text === '/info') {
                const user = await UserModel.findOne({chatId})
                return  bot.sendMessage(chatId, `у вас ${user.right} правильных ответов и ${user.wrong} неправильных`)
            }

            return bot.sendMessage(chatId, `Я тебя не понимаю, ${message.from.first_name}`)

        }catch (e) {
            return bot.sendMessage(chatId, 'Ошибка базы данных')
        }
    })
    bot.on('callback_query', async message => {
        console.log(message)
        const data = message.data
        const chatId = message.message.chat.id
        const user = await UserModel.findOne({chatId})

        if(data === '/again') {
            return startGame(chatId)
        }
        if(data == chats[chatId]) {
            user.right +=1
            await bot.sendMessage(chatId, 'Поздравляю, ты угадал цифру', againOptions)
        }else {
            user.wrong +=1
             await bot.sendMessage(chatId, 'неверно , это было ' + chats[chatId], againOptions)
        }
        await user.save()
    })
}

start()