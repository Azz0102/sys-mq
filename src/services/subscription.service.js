"use strict";
// const subscriptions = {};
// var crypto = require("crypto");
const webpush = require("web-push");
require("dotenv");

// const vapidKeys = {
//     privateKey: process.env.PRIVATE_VAPID_KEY,
//     publicKey: process.env.PUBLIC_VAPID_KEY,
// };

// webpush.setVapidDetails(
//     "mailto:example@yourdomain.org",
//     vapidKeys.publicKey,
//     vapidKeys.privateKey
// );

// function createHash(input) {
//     const md5sum = crypto.createHash("md5");
//     md5sum.update(Buffer.from(input));
//     return md5sum.digest("hex");
// }

// function handlePushNotificationSubscription(req, res) {
//     const subscriptionRequest = req.body.data;
//     const susbscriptionId = createHash(JSON.stringify(subscriptionRequest));
//     subscriptions[susbscriptionId] = subscriptionRequest;
//     res.status(201).json({ id: susbscriptionId });
// }

// function sendPushNotification(req, res) {
//     const subscriptionId = req.params.id;
//     const pushSubscription = subscriptions[subscriptionId];
//     webpush
//         .sendNotification(
//             pushSubscription,
//             JSON.stringify({
//                 title: "New Product Available ",
//                 text: "HEY! Take a look at this brand new t-shirt!",
//                 image: "/images/jason-leung-HM6TMmevbZQ-unsplash.jpg",
//                 tag: "new-product",
//                 url: "/new-product-jason-leung-HM6TMmevbZQ-unsplash.html",
//             })
//         )
//         .catch((err) => {
//             console.log(err);
//         });

//     res.status(202).json({});
// }

// module.exports = { handlePushNotificationSubscription, sendPushNotification };

class Subscription {
    pushToSubscription(subscription, data) {
        const options = {
            vapidDetails: {
                subject: "https://hoangdv.medium.com/",
                publicKey: process.env.PUBLIC_VAPID_KEY,
                privateKey: process.env.PRIVATE_VAPID_KEY,
            },
            // 1 hour in seconds.
            TTL: 60 * 60,
        };

        return webpush.sendNotification(
            subscription,
            JSON.stringify(data),
            options
        );
    }
}

module.exports = new Subscription();
