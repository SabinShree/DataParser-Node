const Sequelize = require('sequelize');

module.exports.connectSequelize = new Sequelize("nepselivetrading_live", 'root', 'root', {
    host: "localhost",
    dialect: "mysql",
    timezone: "+05:45",
    logging: function () {
     },
    pool: {
        max: 100,
        min: 0,
        acquire: 100000,
        idle: 10000
    }
});




