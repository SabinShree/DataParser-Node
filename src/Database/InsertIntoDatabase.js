// for FloorSheet
const tableDb = require('../FilterData/FilterData');
const floorSheet = require('../Model/FloorSheet');

const moment = require('moment');
module.exports = {
    insertFloorSheet: function (data) {
        tableDb.findNewContractNumber(data, (filteredData, dbLastTimeStamp, dbIdNumber, jsonTimeStamp) => {

                if (filteredData === "No Data") {
                    console.log('\x1b[31m%s\x1b[0m', "All data are duplicated. No new Data.\nTrying again in 2 minutes to get the new updated Data.");
                    return;
                }

                let filteredDataLength = filteredData.length;
                const timeDifference = moment.duration(moment(jsonTimeStamp, "YYYY-MM-DD HH:mm:ss").diff(moment(dbLastTimeStamp, 'YYYY-MM-DD HH:mm:ss')));

                let secondDifference = timeDifference / filteredDataLength;
                let i = 0;

                console.log('\x1b[31m%s\x1b[0m', "Updating Serial Number and Timestamps.");

                const dataArrayCorrectTime = filteredData.map(item => {
                    // item.timestamp = moment(dbLastTimeStamp, 'YYYY-MM-DD HH:mm:ss').add(i * secondDifference, 'milliseconds').format('YYYY-MM-DD HH:mm:ss');
                    item.timestamp = moment().format('YYYY-MM-DD-HH:mm:ss');
                    item.serialNumber = dbIdNumber;
                    dbIdNumber++;
                    i++;
                    return item;
                });
                console.log('\x1b[32m%s\x1b[0m', "Update completed for Serial Number and Timestamps.");

                console.log('\x1b[33m%s\x1b[0m', dataArrayCorrectTime.length + " length data is going to be inserted into databases.");
                console.log("\x1b[35m%s\x1b[0m", "Contract Number :" + dataArrayCorrectTime[0].contractNumber + " to " + dataArrayCorrectTime[dataArrayCorrectTime.length - 1].contractNumber + " is inserted into FloorSheet table.");
                try {
                    floorSheet.bulkCreate(dataArrayCorrectTime, {
                            individualHooks: true,
                            returning: true
                        }
                    ).then(data => {
                        console.log('\x1b[32m%s\x1b[0m', "Data is successfully inserted into FloorSheet table. :) ");
                        floorSheet.findAndCountAll({raw: true}).then(databaseData => {
                            console.log("\x1b[34m%s\x1b[0m", "Total number of rows in databases : " + databaseData.rows.length);
                        });
                    }).catch(err => console.log('\x1b[36m%s\x1b[0m', "Error from bulk insert", err));

                } catch
                    (e) {
                    console.log('\x1b[31m%s\x1b[0m', "Error from InsertIntoDatabase file.");
                }
            }
        );
    }
};
