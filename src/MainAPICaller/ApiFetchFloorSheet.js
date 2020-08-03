let moment = require("moment");

let request = require("request");
const fetch = require("node-fetch");
const _ = require("lodash");
const axios = require("axios");
const getMyTokenName = require("../ForPuppetter");

const {Agent} = require("https");
const httpsAgent = new Agent({
    rejectUnauthorized: false, // (NOTE: this will disable client verification)
    passphrase: "YYY"
})

// getMyTokenName().then(result => console.log(result));

function getAuthorizationTokenNEPSE() {
    return new Promise((resolve, reject) => {
        const admin = {
            "username": "g7tPQQwfa5fDdP8BcMDSbQ==.g7tPQQwfa5fDdP8BcMDSbQ==.Lw7uMzqPXZwsPrq9uUDaRA==",
            "password": "g7tPQQwfa5fDdP8BcMDSbQ==.Lw7uMzqPXZwsPrq9uUDaRA=="
        };

        let API_AUTHENTICATE = "https://newweb.nepalstock.com.np/api/authenticate/prove";
        // request(API_AUTHENTICATE,
        //     function (err, response) {
        //         if (err) reject(err);
        //         console.log(response);
        //         const tokenName = response.body.accessToken;
        //         resolve(tokenName);
        //     });
z
        axios(API_AUTHENTICATE, {httpsAgent}).then(response => response.data).then(response => {
            resolve(response.accessToken);
        }).catch(error => console.log(error))
    });
}


function getNepseFloorSheetTotalPageNumber() {
    return new Promise((resolve, reject) => {
        // getMyTokenName().then(tokenName => {
        axios("https://newweb.nepalstock.com.np/api/nots/nepse-data/floorsheet?page=0&size=500&sort=contractId,desc", {httpsAgent}).then(data => {
            const parsedBody = (data.data);
            const totalPage = parsedBody.floorsheets.totalPages;
            resolve(totalPage);
        }).catch(err => {
            console.log(err);
            console.log('\x1b[31m%s\x1b[0m', "Cannot load the page number. ");
        })
        // }).catch(error => console.log(error))


        // request({
        //     // url: "http://newweb.nepalstock.com.np:8500/api/nots/nepse-data/floorsheet?&sort=contractId,desc",
        //     url: "https://newweb.nepalstock.com.np/api/nots/nepse-data/floorsheet?page=0&size=500&sort=contractId,desc",
        //     headers: {
        //         authorization: tokenName
        //     },
        //     rejectUnauthorized: false
        // }, function (err, response) {
        //     if (err) reject(err);
        //     console.log(response);
        //
        //     try {
        //         const parsedBody = JSON.parse(response.body);
        //
        //         const totalPage = parseInt(parsedBody.floorsheets.totalPages);
        //         resolve(totalPage);
        //     } catch (e) {
        //         reject(e);
        //         console.log('\x1b[31m%s\x1b[0m', "Cannot load the page number. ");
        //     }
        // })

    })
}

/**
 * @return {boolean}
 */
function IsJsonString(str) {
    try {
        var json = JSON.parse(str);
        return (typeof json === 'object');
    } catch (e) {
        return false;
    }
}

async function getAllFloorSheetArray() {
    let totalFloorSheetData = [];
    const totalPageNumber = await getNepseFloorSheetTotalPageNumber();
    console.log("The total page to be fetched is : " + totalPageNumber);
    const httpsAgent = new Agent({
        rejectUnauthorized: false, // (NOTE: this will disable client verification)
        passphrase: "YYY"
    })
    const authenticationToken = await getMyTokenName();
    // console.log(authenticationToken);
    for (let i = 0; i < totalPageNumber; i++) {
        let dataFetchLink = await fetch(`https://newweb.nepalstock.com.np/api/nots/nepse-data/floorsheet?page=${i}&size=500&sort=contractId,desc`, {
                method: "GET",
                headers: {
                    Authorization: authenticationToken,
                },
                agent: httpsAgent
            }
        );

        let dataToText = await dataFetchLink.text();
        try {
            const jsonData = await JSON.parse(dataToText);
            let floorSheetData = await jsonData.floorsheets.content;
            console.log('\x1b[36m%s\x1b[0m', "From page: " + i + ", Total data fetched is : " + floorSheetData.length);
            totalFloorSheetData = await totalFloorSheetData.concat(floorSheetData);
        } catch (e) {
            console.log("Cannot parse the data into json from page " + i);
            console.log("Data would be fetched in next run");
        }
    }
    const time = moment().format('YYYY-MM-DD HH:mm:ss');


    totalFloorSheetData = await totalFloorSheetData.map((item, index) => {
        return {
            serialNumber: item.id,
            contractNumber: item.contractId,
            stockSymbol: item.stockSymbol,
            buyerBroker: item.buyerMemberId,
            sellerBroker: item.sellerMemberId,
            quantity: item.contractQuantity,
            rate: item.contractRate,
            amount: item.contractAmount,
            timestamp: time
        }
    });


    await totalFloorSheetData.sort(function (first, second) {
        return first.contractNumber - second.contractNumber;
    });

    totalFloorSheetData = _.uniqBy(totalFloorSheetData, "contractNumber");
    console.log(totalFloorSheetData[0].contractNumber + " to " + totalFloorSheetData[totalFloorSheetData.length - 1].contractNumber + "\n Total length : " + totalFloorSheetData.length);
    return totalFloorSheetData;

}

// getAllFloorSheetArray().then(data => {
//     console.log("the total data length " + data.length);
//     fs.writeFile("FloorSheet.json", JSON.stringify(data), function (err) {
//         if (err) {
//             return console.log(err);
//         }
//         console.log("The file was saved!");
//     });
// }).catch(err => console.log(err));

// getNepseFloorSheetTotalPageNumber().then(totalPageNumber => {
//     return new Promise((resolve, reject) => {
//         let totalFloorSheetArray = [];
//         getAuthorizationTokenNEPSE().then(tokenNumber => {
//             for (let i = 0; i < totalPageNumber; i++) {
//                 // fetch({
//                 //     url: `http://newweb.nepalstock.com.np:8500/api/nots/nepse-data/floorsheet?page=${i}&size=500&sort=contractId,desc`,
//                 //     headers: {
//                 //         "Accept": "application/json",
//                 //         authorization: tokenNumber
//                 //     },
//                 //     rejectUnauthorized: false
//                 /*function (err, response) {
//                         if (err) {
//                             reject(err);
//                         }
//                         const parsedBody = (response.body);
//                         console.log("from page " + i);
//                         if (IsJsonString(parsedBody)) {
//                             const jsonBody = JSON.parse(parsedBody);
//                             let floorsheet = Array.from(jsonBody.floorsheets.content);
//                             totalFloorSheetArray.push(floorsheet);
//                         } else {
//                             console.log(parsedBody);
//                         }
//                     })*/
//
//                 fetch(`http://newweb.nepalstock.com.np:8500/api/nots/nepse-data/floorsheet?page=${i}&size=500&sort=contractId,desc`, {
//                     method: "GET",
//                     headers: {
//                         Authorization: tokenNumber,
//                     },
//                     rejectUnauthorized: false
//                 }).then(data => data.json()).then(data => console.log(data)).catch(err => console.log(err));
//             }
//
//         });
//         console.log(totalFloorSheetArray.length);
//         resolve(totalFloorSheetArray);
//
//     }).then(data => console.log("my data length is " + data.length));
// })
// ;


// http://newweb.nepalstock.com.np:8500/api/nots/nepse-data/floorsheet?&size=500&sort=contractId,desc

// getNepseData().then(data => {
//     console.log(data);
//     data = JSON.parse(data);
//     let floorsheet = Array.from(data.floorsheets.content);
//     return floorsheet.map((item, index) => {
//         return {
//             serialNumber: item.id,
//             contractNumber: item.contractId,
//             stockSymbol: item.stockSymbol,
//             buyerBroker: item.buyerMemberId,
//             sellerBroker: item.sellerMemberId,
//             quantity: item.contractQuantity,
//             rate: item.contractRate,
//             amount: item.contractAmount,
//             timestamp: item.tradeTime
//         }
//     })
//
// }).then(data => console.log(data));

module.exports.FloorSheetAPI = function () {
    const myFnEventEmitter = new (require('events').EventEmitter)();
    getAllFloorSheetArray().then(data => myFnEventEmitter.emit('started', data)).catch(err => console.log(err));
    return myFnEventEmitter;
};