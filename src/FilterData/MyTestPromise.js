const fetch = require("node-fetch");

function MyPromise(callback) {
    fetch("https://jsonplaceholder.typicode.com/posts").then(data => data.json()).then(data => {
        console.log("From first promise");
        return fetch("https://jsonplaceholder.typicode.com/posts").then(data => data.json()).then(data => {
            return "sabin is hero";
        });

    }).then(data => callback(data));
}

MyPromise(data => console.log(data));