const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const fs = require('fs');
const moment = require('moment');


function extractPageNumberFromUrl(url) {
    // let url = "http://www.nepalstock.com/main/floorsheet/index/1/?contract-no=&stock-symbol=&buyer=&seller=&_limit=500\n";
    url = url.split("index/")[1].split("/")[0];
    return url;
    // console.log(url);
}

async function getOldFloorSheetData() {
    let jsonData = [];

    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    try {
        page.setDefaultNavigationTimeout(100000);
    } catch (e) {
        console.log("Cannot connect to site. Trying again in two minutes.");

    }
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');
    try {
        await page.goto("http://www.nepalstock.com/floorsheet", {waitUntil: 'networkidle2'});
        await page.select("#news_info-filter > label:nth-child(5) > select", "500");
        await page.click("#news_info-filter > input.btn.btn-success");
        await page.waitFor(500);
        await page.waitFor("#home-contents > table > tbody > tr:nth-child(503) > td > div", {
            visible: true
        });
        await page.click("[title='Last Page']");

        if (typeof page.url() === "string" && page.url().startsWith("http://www.nepalstock.com/main/floorsheet/")) {
            return extractPageNumberFromUrl(page.url());
        } else return new Error("NOOOOOOOOOOOOOOOO");
    } catch (e) {
        await browser.close();
        console.log(e);
        console.log("Cannot connect to site. Trying again in 2 minutes.")
    } finally {
        await browser.close();
    }
}

function getAllData() {
    return getOldFloorSheetData().then(async pageNumber => {
        console.log("The page number is ", pageNumber);
        let mainTableData = [];
        let jsonHeaderTable = [];

        let jsonBodyTable = [];
        let data = {
            contractNumber: "td:nth-child(2) __${getInto}__ INTEGER",
            stockSymbol: "td:nth-child(3)",
            buyerBroker: "td:nth-child(4) __${getInto}__ INTEGER",
            sellerBroker: "td:nth-child(5) __${getInto}__ INTEGER",
            quantity: "td:nth-child(6) __${getInto}__ INTEGER",
            rate: "td:nth-child(7) __${getInto}__ DOUBLE",
            amount: "td:nth-child(8) __${getInto}__ DOUBLE",
            timestamp: true
        };

        for (let keysTables of Object.keys(data)) {
            jsonHeaderTable.push(keysTables);
        }

        for (let keysTables of Object.values(data)) {
            jsonBodyTable.push(keysTables);
        }
        // console.log(jsonBodyTable);
        const time = moment().format('YYYY-MM-DD-HH:mm:ss');

        const browser = await puppeteer.launch({
            headless: false
        });
        const page = await browser.newPage();
        try {
            page.setDefaultNavigationTimeout(100000);
        } catch (e) {
            console.log("Cannot connect to site. Trying again in two minutes.");
        }
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');


        let tableDetails;
        try {
            for (let i = 1; i <= pageNumber; i++) {
                let url = `http://www.nepalstock.com/main/floorsheet/index/${i}/?contract-no=&stock-symbol=&buyer=&seller=&_limit=500`;
                await page.goto(url, {waitUntil: 'networkidle2'});

                // await page.waitFor("#home-contents", {visible: true});
                await page.waitFor("#home-contents > table > tbody", {visible: true});

                // let table = document.querySelector("#home-contents > table > tbody");


                tableDetails = await page.evaluate((BodyTable, time) => {
                    console.log("The data is sabin dai");
                    let table = document.querySelector("#home-contents > table > tbody");
                    let table_panels = Array.from(table.children);

                    table_panels.pop();
                    table_panels.pop();
                    table_panels.pop();
                    table_panels.shift();
                    table_panels.shift();

                    return table_panels.map(panels => {
                        let arr = [];
                        for (let i = 0; i < BodyTable.length; i++) {
                            const index = BodyTable[i];
                            if (typeof index === "string")
                                if (index.includes(' __${getInto}__ ')) {
                                    const breakElement = index.split(' __${getInto}__ ');
                                    const selector = breakElement[0];
                                    let dataType = breakElement[1];
                                    if (dataType === 'INTEGER') {
                                        arr.push(parseInt(panels.querySelector(selector).innerHTML.trim().replace(/,/g, '')));
                                    } else if (dataType === "DOUBLE") {
                                        arr.push(parseFloat(parseFloat(panels.querySelector(selector).innerHTML.trim().replace(/,/g, '')).toFixed(2)));
                                    }
                                } else {
                                    arr.push(panels.querySelector(BodyTable[i]).innerText.trim());
                                }
                        }
                        arr.push(time);
                        return arr;
                    });
                }, jsonBodyTable, time).catch(error => console.log(error));

                mainTableData.push(tableDetails);
            }
        } catch (e) {
            await browser.close();
            console.log(e);
        } finally {
            await browser.close();
            let finalObjectArray = [];
            mainTableData = [].concat.apply([], mainTableData);
            let things;
            for (let i = 0; i < mainTableData.length; i++) {
                things = {};
                for (let j = 0; j < jsonHeaderTable.length; j++) {
                    things[jsonHeaderTable[j]] = mainTableData[i][j];
                }
                finalObjectArray.push(things);
            }

            finalObjectArray.sort(function (first, second) {
                return first.contractNumber - second.contractNumber;
            });
            finalObjectArray = finalObjectArray.filter((obj, pos, arr) => {
                return arr.map(mapObj => mapObj['contractNumber']).indexOf(obj['contractNumber']) === pos;
            });

            console.log(finalObjectArray.length);
            return finalObjectArray;
        }


    }).catch(onerror => {
        console.log("cannot get the total page number", onerror);
    });
}

module.exports.FloorSheetCrawler = function () {
    const myFnEventEmitter = new (require('events').EventEmitter)();
    getAllData().then(data => myFnEventEmitter.emit('started', data)).catch(err => console.log(err));
    return myFnEventEmitter;
};