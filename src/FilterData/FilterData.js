const floorSheetDatabase = require('../Model/FloorSheet');
const moment = require('moment');

// module.exports.findNewContractNumber = function (filteredNewData, callback) {
//     let timeStamps = filteredNewData[filteredNewData.length - 1].timestamp;
//     const lastTime = moment().format("YYYY-MM-DD") + ' 15:00:00';
//     if (lastTime <= timeStamps) {
//         timeStamps = lastTime;
//     }
//     let firstValue = 1;
//
//     floorSheetDatabase.findAndCountAll({raw: true}).then(databaseData => {
//
//         if (databaseData.count > 0) {
//             let databaseLastContractNumber = findDatabaseData(databaseData.rows);
//             let databaseLastId = databaseLastContractNumber.serialNumber;
//             let databaseLastContractNumberTimeStamp = databaseLastContractNumber.timestamp;
//             let missingData = checkMissingData(databaseData.rows, filteredNewData);
//             console.log(databaseLastContractNumberTimeStamp);
//             let missingDataContractNoArray = [];
//             if (missingData.length >= 1) {
//                 // console.log("The missing data is " + JSON.stringify(missingData));
//                 console.log("The missing data length is " + missingData.length);
//                 missingData.forEach(item => missingDataContractNoArray.push(item.contractNumber));
//                 floorSheetDatabase.destroy({
//                     where: {
//                         contractNumber: missingDataContractNoArray
//                     }
//                 }).then(() => console.log("Data deleted first item  : " + missingDataContractNoArray[0] + " Last element is " + missingDataContractNoArray[missingDataContractNoArray.length - 1]));
//             }
//
//             const findIndex = filteredNewData.findIndex(item => item.contractNumber === databaseLastContractNumber.contractNumber);
//             if (findIndex === -1) {
//                 callback("No Data", databaseLastContractNumberTimeStamp, databaseLastId, timeStamps);
//                 return;
//             }
//             const returnedData = filteredNewData.slice(missingData.length >= 1 ? findIndex - 1 : findIndex + 1, filteredNewData.length);
//             callback(returnedData, databaseLastContractNumberTimeStamp, databaseLastId, timeStamps);
//         } else {
//             callback(filteredNewData, moment().format("YYYY-MM-DD") + ' 11:00:00', firstValue, timeStamps);
//         }
//
//     }).catch(err => {
//         console.log("Error from filterData: findNewContractNumber");
//         console.log(err);
//     });
// };


module.exports.findNewContractNumber = function (filteredNewData, callback) {
    let timeStamps = filteredNewData[filteredNewData.length - 1].timestamp;
    // const lastTime = moment().format("YYYY-MM-DD") + ' 15:00:00';
    const lastTime = moment().format("YYYY-MM-DD") + ' 15:00:00';
    if (lastTime <= timeStamps) {
        timeStamps = lastTime;
    }
    let firstValue = 1;

    floorSheetDatabase.findAndCountAll({raw: true}).then(databaseData => {
        if (databaseData.count > 0) {
            let missingData = checkMissingData(databaseData.rows, filteredNewData);
            let missingDataContractNoArray = [];
            if (missingData.length >= 1) {
                // console.log("The missing data is " + JSON.stringify(missingData));
                missingData.forEach(item => missingDataContractNoArray.push(item.contractNumber));
                return floorSheetDatabase.destroy({
                    where: {
                        contractNumber: missingDataContractNoArray
                    }
                }).then(data =>
                    missingData).catch(err => console.log("the error is " + err));

                //         return floorSheetDatabase.destroy({
                //             where: {
                //                 contractNumber: missingDataContractNoArray
                //             }
                //         }).then((rowDeleted) => {
                //             const findIndex = filteredNewData.findIndex(item => item.contractNumber === databaseLastContractNumber.contractNumber);
                //             if (findIndex === -1) {
                //                 callback("No Data", databaseLastContractNumberTimeStamp, databaseLastId, timeStamps);
                //                 return;
                //             }
                //             const returnedData = filteredNewData.slice(missingData.length >= 1 ? findIndex - 1 : findIndex + 1, filteredNewData.length);
                //             console.log("Data to be inserted is " + returnedData[0].contractNumber + " to " + returnedData[returnedData.length - 1].contractNumber);
                //             callback(returnedData, databaseLastContractNumberTimeStamp, databaseLastId, timeStamps);
                //         }).catch(err => console.log("Error while deleting missing data : " + err));
                //
                //     }
            } else {
                return missingData;
            }
        } else {
            console.log('\x1b[31m%s\x1b[0m', "Database is empty.Inserting for the  first time");
            callback(filteredNewData, moment().format("YYYY-MM-DD") + ' 11:00:00', firstValue, timeStamps);
        }

    }).then(missingDataInfo => {
        // if (missingDataInfo.length !== 0)
        //     console.log("the missing data length is " + missingDataInfo[0].contractNumber + " to " + missingDataInfo[missingDataInfo.length - 1].contractNumber);
        return floorSheetDatabase.findAndCountAll({raw: true}).then(databaseData => {
            return {
                missingDataInfo,
                databaseData
            }
        }).catch(err => console.log(err));
    }).then(data => {

        try {
            const {missingDataInfo, databaseData} = data;
            if (missingDataInfo.length === 0) {
                callback("No Data", null, null, null);
            } else {
                let databaseLastContractNumber = findDatabaseData(databaseData.rows);
                let databaseLastId = databaseLastContractNumber.serialNumber;
                let databaseLastContractNumberTimeStamp = databaseLastContractNumber.timestamp;
                const findIndex = filteredNewData.findIndex(item => item.contractNumber === databaseLastContractNumber.contractNumber);
                if (findIndex === -1) {
                    callback("No Data", databaseLastContractNumberTimeStamp, databaseLastId, timeStamps);
                    return;
                }
                const returnedData = filteredNewData.slice(missingDataInfo.length >= 1 ? findIndex + 1 : findIndex + 1, filteredNewData.length);
                callback(returnedData, databaseLastContractNumberTimeStamp, databaseLastId + 1, timeStamps);
            }
        } catch (e) {
            console.log('\x1b[31m%s\x1b[0m', "Error from FilterData:");
        }
    }).catch(err => {
        console.log('\x1b[31m%s\x1b[0m', "Error from filterData: findNewContractNumber");
        console.log(err);
    });

};

function findDatabaseData(databaseData) {
    databaseData.sort((first, second) => {
        return first.contractNumber - second.contractNumber;
    });
    return databaseData[databaseData.length - 1];
}


function checkMissingData(databaseArray, jsonArray) {
    console.log("Checking missing data.");
    let arr = [];
    let index = jsonArray.findIndex(object => !databaseArray.find(o2 => object.contractNumber === o2.contractNumber));
    if (index === -1) {
        console.log("Checking missing data completed.");
        return [];
    }
    for (let c = index; c < jsonArray.length; c++) {
        arr.push(jsonArray[index]);
        index++;
    }
    console.log("Checking missing data completed.");
    return arr;
}



