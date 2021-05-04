const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'telegaDB',
    'nikita',
    'Bender2282',
    {
        host: '94.26.250.38',
        pool: '6432',
        dialect: 'postgres'
    }
)