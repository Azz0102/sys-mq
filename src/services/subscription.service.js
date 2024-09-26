"use strict";
// const subscriptions = {};
// var crypto = require("crypto");
const webpush = require("web-push");
require("dotenv");

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    const serviceAccount = require("../../service_key.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
class Subscription {
    async pushToSubscription(subscription, message) {
        // if (!subscription) {
        //     throw new Error("No subscription available");
        // }

        // const options = {
        //     vapidDetails: {
        //         subject: "https://localhost:3000/",
        //         publicKey: process.env.PUBLIC_VAPID_KEY,
        //         privateKey: process.env.PRIVATE_VAPID_KEY,
        //     },
        //     // 1 hour in seconds.
        //     TTL: 60 * 60,
        // };

        const token =
            "cWPqvJVP5GQgRhc_jH0iMY:APA91bF5taz_h_Oq9Q1Fws3tAyBIpYNF1LKx0qyMyI-LQbNBHR2d9J3DwLFinJKYZl9naALiPbncuoBHB0ujqJRYZQr_uzxS2GAi90lomEzRlee7A6VPoY8Bte83berESw97xKcJb-q0";
        const link = "https://localhost:3000/user/note";
        const payload = {
            token,
            notification: {
                title: "Notification",
                body: message,
            },
            webpush: link && {
                fcmOptions: {
                    link,
                },
            },
        };

        // return webpush.sendNotification(
        //     subscription,
        //     JSON.stringify(data),
        //     options
        // );

        return await admin.messaging().send(payload);
    }
}

module.exports = new Subscription();
