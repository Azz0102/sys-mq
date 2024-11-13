const dotenv = require("dotenv");
dotenv.config();

const config = {
    PORT: process.env.PORT || 4000,
    RabbitMQ_URL: process.env.RABBIT_URL,
};

module.exports = config;
