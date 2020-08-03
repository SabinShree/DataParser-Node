const apiCaller = require("./MainAPICaller/ApiFetchFloorSheet");
let CronJob = require('cron').CronJob;
const insertIntoDatabase = require('./Database/InsertIntoDatabase');
const oldSite = require("./OldSiteParser/ParseOldSite");
let cornTimeLimit = "*/2 * * * *";


// setInterval(() => {
//     console.log('You will see this message every 2 minutes. \nFloorSheetAPI is being called.');
//     apiCaller.FloorSheetAPI.on("started", floorSheetData => {
//         insertIntoDatabase.insertFloorSheet(floorSheetData)
//     })
// }, 1000);


const repeatingJob = new CronJob(cornTimeLimit, function () {
    // apiCaller.FloorSheetAPI().on("started", floorSheetData => {
    //     insertIntoDatabase.insertFloorSheet(floorSheetData);
    // })

    oldSite.FloorSheetCrawler().on("started", floorSheetData => {
        insertIntoDatabase.insertFloorSheet(floorSheetData);
    })
});


// let runApiCaller = () => {
//     let run = true;
//     try {
//         while (run) {
//             apiCaller.FloorSheetAPI().on("started", floorSheetData => {
//                 console.log("** System is fetching from api.*");
//                 insertIntoDatabase.insertFloorSheet(floorSheetData, callback => console.log(callback));
//             })
//         }
//     } catch (e) {
//         console.log(e);
//     }
// };
// runApiCaller();

repeatingJob.start();