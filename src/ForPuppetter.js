const puppeteer = require('puppeteer');
const request_client = require('request-promise-native');

async function getTokenName() {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const result = [];
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');

    await page.setRequestInterception(true);

    try {
        page.on('request', request => {
            request_client({
                uri: request.url(),
                resolveWithFullResponse: true,
                rejectUnauthorized: false, // (NOTE: this will disable client verification)

            }).then(response => {
                const request_url = request.url();
                if (request_url === 'https://newweb.nepalstock.com.np/api/nots/nepse-data/floorsheet?&sort=contractId,desc') {
                    const request_headers = request.headers();
                    result.push({
                        request_url,
                        request_headers,
                    });
                }

                request.continue();
                return result;
            }).catch(error => {
                console.log(error)
                request.abort();
            });
        });

        await page.goto("https://newweb.nepalstock.com.np/floor-sheet", {
            waitUntil: 'networkidle0',
        });

        await browser.close();
        return result;
    } catch (e) {
        console.log(e);
    }
}

function getMyTokenName() {
    return new Promise((resolve, reject) => {
        getTokenName().then(result => {
            resolve(result[0].request_headers.authorization);
        }).catch(error => reject("Cannot get token Name"));
    })
}

getMyTokenName();

module.exports = getMyTokenName;

