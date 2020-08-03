// import {Agent} from "https";
const axios = require("axios");
const {Agent} = require("https");
let request = require("request");

const httpsAgent = new Agent({
    rejectUnauthorized: false, // (NOTE: this will disable client verification)
    headers: {
        Authorization: "Bearer eyJhbGciOiJIUzUxMiJ928.eyJyb2xlcyI6IkFkbWluIiwiaXNzIjoieWNvIiwic3ViIjoiNCIsImlhdCI6MTU5MzQxNzcwMywiZXhwIjoxNTkzNDE4MDAzfQ108.h1sbjkn_87R1wMxim3l3PWp3Ro4DJPw3gTTHXl2Plmo1kNqSvX_lS74RVHhHnH6wm6BQdFuD-YFsex66Bqbq9A"
    }
})
let API_AUTHENTICATE = "https://newweb.nepalstock.com.np/api/authenticate/prove";
// request({
//         url: API_AUTHENTICATE, headers: {
//             authorization: "Bearer eyJhbGciOiJIUzUxMiJ919.eyJyb2xlcyI6IkFkbWluIiwiaXNzIjoieWNvIiwic3ViIjoiNCIsImlhdCI6MTU5MzQxODc0NSwiZXhwIjoxNTkzNDE5MDQ1fQ57.7rgarPlocSmfvMVaptZ823ulXLMppIKAMJlkIR64oRGXVtshe6OPGISrEISeD6X2F-U-4Q_YEier3yaazpI6Aw"
//         }, rejectUnauthorized: false
//
//     },
//     function (err, response) {
//         if (err) console.log(err);
//         console.log(response);
//         const tokenName = response;
//     });


axios(API_AUTHENTICATE, {httpsAgent}).then(response => response.data).then(response => {
    console.log(response.accessToken);
    axios("https://newweb.nepalstock.com.np/api/nots/nepse-data/floorsheet?page=0&size=500&sort=contractId,desc", {
        httpsAgent: httpsAgent, headers: {
            Authorization: response.accessToken
        }
    }).then(data => {
        console.log(data.data);
    }).catch(err => console.log(err))
}).catch(error => console.log(error))


// axios("https://newweb.nepalstock.com.np/api/nots/nepse-data/floorsheet?page=2&size=500&sort=contractId,desc", {
//     httpsAgent
// }).then(response => {
//     console.log(response.data);
// }).catch(error => console.log(error))


// request({
//     // url: "http://newweb.nepalstock.com.np:8500/api/nots/nepse-data/floorsheet?&sort=contractId,desc",
//     url: "https://newweb.nepalstock.com.np/api/nots/nepse-data/floorsheet?page=0&size=500&sort=contractId,desc",
//     headers: {
//         authorization: "Bearer eyJhbGciOiJIUzUxMiJ928.eyJyb2xlcyI6IkFkbWluIiwiaXNzIjoieWNvIiwic3ViIjoiNCIsImlhdCI6MTU5MzQxNzcwMywiZXhwIjoxNTkzNDE4MDAzfQ108.h1sbjkn_87R1wMxim3l3PWp3Ro4DJPw3gTTHXl2Plmo1kNqSvX_lS74RVHhHnH6wm6BQdFuD-YFsex66Bqbq9A"
//     },
//     rejectUnauthorized: false
// }, function (err, response) {
//     if (err) {
//         console.log(err);
//         return;
//     }
//     console.log(response);
// })
//
