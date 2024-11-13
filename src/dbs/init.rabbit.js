"use strict";

const amqp = require("amqplib");
const config = require("../../config");

const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(config.RabbitMQ_URL);

        if (!connection) throw new Error("Connection not established");

        const channel = await connection.createChannel();

        return { channel, connection };
    } catch (error) {
        console.error("Error connecting to RabbitMQ", error);
        throw err;
    }
};

const connectToRabbitMQForTest = async () => {
    try {
        const { channel, connection } = await connectToRabbitMQ();

        // Publish messages to queue
        const queue = "test-queue";
        const message = "Hello, shopDEV by ITicetea";
        await channel.assertQueue(queue);
        await channel.sendToQueue(queue, Buffer.from(message));

        // close connection
        await connection.close();
    } catch (error) {
        console.error(`Error connecting to RabbitMQ`, error);
    }
};

const consumerQueue = async (channel, queueName) => {
    try {
        await channel.assertQueue(queueName, { durable: true });
        console.log(`Waiting for messages...`);
        channel.consume(
            queueName,
            (msg) => {
                console.log(
                    `Received message: ${queueName}::`,
                    msg.content.toString()
                );
                // 1. Find User following Shop
                // 2. Send message to User
                // 3. yes, ok ===> success
                // 4. error. setup DLX
            },
            {
                noAck: true,
            }
        );
    } catch (error) {
        console.error(`error publish message to RabbitMQ::`, error);
        throw error;
    }
};

module.exports = { connectToRabbitMQ, connectToRabbitMQForTest, consumerQueue };
