"use strict";
// const subscriptions = {};
// var crypto = require("crypto");
require("dotenv").config();
const { Expo } = require("expo-server-sdk");
const admin = require("firebase-admin");
let expo = new Expo();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    const serviceAccount = require("../../service_key.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
class Subscription {
    async pushToSubscription(subscription, message, type, id) {
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

        console.log("sub", subscription);
        if (subscription.KeyStore.device === "web") {
            const link = `https://${process.env.FRONTEND_URL}/user/news/${id}`;
            const payload = {
                token: subscription.endpoint,
                webpush: {
                    fcmOptions: {
                        link,
                    },
                    notification: {
                        title: "Thông báo",
                        body: message,
                        icon: "https://res.cloudinary.com/iticeteashop/image/upload/v1733644959/web-app-manifest-192x192_nybyhr.png",
                    },
                },
            };
            return await admin.messaging().send(payload);
        } else {
            let messages = [];

            // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(subscription.endpoint)) {
                console.error(
                    `Push token ${subscription.endpoint} is not a valid Expo push token`
                );
                return;
            }

            // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
            messages.push({
                to: subscription.endpoint,
                sound: "default",
                title: "Thông báo",
                body: message,
                data: { withSome: "data" },
                // icon: "https://res.cloudinary.com/iticeteashop/image/upload/v1733644959/web-app-manifest-192x192_nybyhr.png",
            });

            let chunks = expo.chunkPushNotifications(messages);
            let tickets = [];
            (async () => {
                // Send the chunks to the Expo push notification service. There are
                // different strategies you could use. A simple one is to send one chunk at a
                // time, which nicely spreads the load out over time:
                for (let chunk of chunks) {
                    try {
                        let ticketChunk = await expo.sendPushNotificationsAsync(
                            chunk
                        );
                        console.log(ticketChunk);
                        tickets.push(...ticketChunk);
                        // NOTE: If a ticket contains an error code in ticket.details.error, you
                        // must handle it appropriately. The error codes are listed in the Expo
                        // documentation:
                        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                    } catch (error) {
                        console.error(error);
                    }
                }
            })();

            let receiptIds = [];
            for (let ticket of tickets) {
                // NOTE: Not all tickets have IDs; for example, tickets for notifications
                // that could not be enqueued will have error information and no receipt ID.
                if (ticket.status === "ok") {
                    receiptIds.push(ticket.id);
                }
            }

            let receiptIdChunks =
                expo.chunkPushNotificationReceiptIds(receiptIds);
            (async () => {
                // Like sending notifications, there are different strategies you could use
                // to retrieve batches of receipts from the Expo service.
                for (let chunk of receiptIdChunks) {
                    try {
                        let receipts =
                            await expo.getPushNotificationReceiptsAsync(chunk);
                        console.log(receipts);

                        // The receipts specify whether Apple or Google successfully received the
                        // notification and information about an error, if one occurred.
                        for (let receiptId in receipts) {
                            let { status, message, details } =
                                receipts[receiptId];
                            if (status === "ok") {
                                continue;
                            } else if (status === "error") {
                                console.error(
                                    `There was an error sending a notification: ${message}`
                                );
                                if (details && details.error) {
                                    // The error codes are listed in the Expo documentation:
                                    // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                                    // You must handle the errors appropriately.
                                    console.error(
                                        `The error code is ${details.error}`
                                    );
                                }
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            })();
        }
    }
}

module.exports = new Subscription();
