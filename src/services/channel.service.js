"use strict";
const amqp = require("amqplib/callback_api");

const Subscription = require("./subscription.service");
function obj() {
    this.openConnection = async () => {
        try {
            await amqp.connect(config.RabbitMQ_URL, (err, conn) => {
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
            await conn.createChannel((err, ch) => {
                if (err) {
                    throw err;
                }
                ch.assertQueue(queue);

                console.log("Channel created for User " + queue);
                global.onlineusers[userid] = ch;
                global.onlineusers[queue] = socket.id;

                ch.consume(
                    queue,
                    async (msg) => {
                        console.log(
                            "Msg received for Queue " +
                                queue +
                                " . Message received is " +
                                msg.content.toString()
                        );

                        const { message, data } = JSON.parse(
                            msg.content.toString()
                        );

                        const userSub = data.find(
                            (user) => user.name === queue
                        );

                        if (!userSub) {
                            console.log(
                                "No subscription found for user " + queue
                            );
                            return;
                        }

                        const formattedSubscription = userSub.Subscription.map(
                            (sub) => ({
                                endpoint: sub.endpoint,
                                expirationTime: sub.expirationTime,
                                keys: {
                                    p256dh: sub.p256dh,
                                    auth: sub.auth,
                                },
                            })
                        );

                        await Subscription.pushToSubscription(
                            formattedSubscription,
                            message
                        );

                        // var message = {
                        //     username: queue,
                        //     content: msg.content.toString(),
                        // };

                        // io.to(global.onlineusers[queue]).emit(
                        //     "message",
                        //     message
                        // );
                    },
                    { noAck: true }
                );
            });
        } catch (error) {
            return error;
        }
    };
}

module.exports = new obj();
