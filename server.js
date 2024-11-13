"use strict";

const {
    consumerToQueue,
    consumerToQueueNormal,
    consumerToQueueFailed,
} = require("./src/services/consumerQueue.service");
const queueName = "test-topic";

// consumerToQueueNormal(queueName)
//     .then(() => {
//         console.log(`Message consumerToQueueNormal started  `);
//     })
//     .catch((err) => {
//         console.error(`Message Error: ${err.message}`);
//     });

// consumerToQueueFailed(queueName)
//     .then(() => {
//         console.log(`Message consumerToQueueFailed started  `);
//     })
//     .catch((err) => {
//         console.error(`Message Error: ${err.message}`);
//     });

global.config = require("./config");

const notificationServer = require("./src/services/notification.service");
global.onlineusers = {};
global.socketIDS = [];

setTimeout(() => {
    notificationServer.start();
}, 1000);
