const IORedis = require("ioredis");

let connection = null;

const getRedisConnection = () => {
  if (!connection) {
    connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
};

module.exports = { getRedisConnection };
