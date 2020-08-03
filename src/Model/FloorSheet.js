const Sequelize = require('sequelize');
const dbFile = require('../Database/mysqlConnect');
const db = dbFile.connectSequelize;
const floorSheet = db.define('floorsheet_live', {
    serialNumber: {
        type: Sequelize.INTEGER, allowNull: false
    },
    contractNumber: {
        type: Sequelize.BIGINT, allowNull: false, primaryKey: true
    },
    stockSymbol: {
        type: Sequelize.STRING, allowNull: false
    },
    buyerBroker: {
        type: Sequelize.INTEGER, allowNull: false
    },
    sellerBroker: {
        type: Sequelize.INTEGER, allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER, allowNull: false
    },
    rate: {
        type: Sequelize.DOUBLE, allowNull: false
    },
    amount: {
        type: Sequelize.DOUBLE, allowNull: false
    },
    timestamp: {
        type: "TIMESTAMP", allowNull: true
    }
}, {
    tableName: 'floorsheet_live',
    timestamps: false
});

floorSheet.sync();

module.exports = floorSheet;