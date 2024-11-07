"use strict";
const amqp = require("amqplib/callback_api");
const { connectToRabbitMQ } = require("../dbs/init.rabbit");
const Subscription = require("./subscription.service");
function obj() {
    this.openConnection = async () => {
        try {
            await amqp.connect("amqp://guest:guest@localhost", (err, conn) => {
                if (err) {
                    throw err;
                }
                global.connection = conn;
                console.log("Connection created with RabbitMQ!!!");
            });
        } catch (error) {
            return error;
        }
    };

    this.createchannel = async (conn, queue, userid, socket, io) => {
        try {
            await conn.createChannel(async (err, ch) => {
                if (err) {
                    throw err;
                }
                const channel = "coke_studio";
                const ExchangeDLX = "notificationExDLX" + queue;
                const RoutingKeyDLX = "notificationRoutingKeyDLX" + queue;
                await ch.assertExchange(queue, "fanout", { durable: true });
                const queueResult0 = await ch.assertQueue(queue, {
                    durable: true,
                    exclusive: false, // allow many connections to queue
                    arguments: {
                        "x-dead-letter-exchange": ExchangeDLX,
                        "x-dead-letter-routing-key": RoutingKeyDLX,
                    },
                });
                await ch.bindQueue(queueResult0.queue, channel, channel);

                console.log("Channel created for User " + queue);
                global.onlineusers[userid] = ch;
                global.onlineusers[queue] = socket.id;

                ch.prefetch(1);

                ch.consume(queue, async (msg) => {
                    try {
                        const { message, subscriptions } = JSON.parse(
                            msg.content.toString()
                        );

                        console.log("Message received: ", message);

                        console.log(
                            "Msg received for Queue " +
                                queue +
                                " . Message received is " +
                                msg.content.toString()
                        );

                        console.log("Subscription " + subscriptions);

                        const userSub = subscriptions.find(
                            (subscription) =>
                                subscription.KeyStore.User.name === queue
                        );

                        // const userSub = data.find(
                        //     (user) => user.name === queue
                        // );

                        // if (!userSub) {
                        //     console.log(
                        //         "No subscription found for user " + queue
                        //     );
                        //     ch.ack(msg);
                        //     return;
                        // }

                        // const formattedSubscription = userSub.Subscription.map(
                        //     (sub) => ({
                        //         endpoint: sub.endpoint,
                        //         expirationTime: sub.expirationTime,
                        //         keys: {
                        //             p256dh: sub.p256dh,
                        //             auth: sub.auth,
                        //         },
                        //     })
                        // );

                        // const formattedSubscription = {};

                        await Subscription.pushToSubscription(userSub, message);

                        // var message = {
                        //     username: queue,
                        //     content: msg.content.toString(),
                        // };

                        // io.to(global.onlineusers[queue]).emit(
                        //     "message",
                        //     message
                        // );
                        ch.ack(msg);
                    } catch (error) {
                        console.error(`Error processing message:`, error);
                        ch.nack(msg, false, false);
                    }
                });

                // Failed queue processing
                const notificationExchangeDLX = "notificationExDLX" + queue;
                const notificationRoutingKeyDLX =
                    "notificationRoutingKeyDLX" + queue;
                const notiQueueHandle = "notificationQueueHotFix" + queue;

                await ch.assertExchange(notificationExchangeDLX, "direct", {
                    durable: true,
                });

                const queueResult = await ch.assertQueue(notiQueueHandle, {
                    exclusive: false,
                });

                await ch.bindQueue(
                    queueResult.queue,
                    notificationExchangeDLX,
                    notificationRoutingKeyDLX
                );

                await ch.consume(
                    queueResult.queue,
                    (msgFailed) => {
                        console.log(
                            `This notification error, please hot fix:: ${msgFailed.content.toString()}`
                        );
                    },
                    {
                        noAck: true,
                    }
                );
            });
        } catch (error) {
            return error;
        }
    };
}

module.exports = new obj();
