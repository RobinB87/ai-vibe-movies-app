import Redis from 'ioredis';

const redis = new Redis({
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  host: process.env.REDIS_HOST || "127.0.0.1",
  // password: "auth",
  // db: 0,
});

redis.on('connect', () => console.log('Connected to Redis!'));
redis.on('error', (err) => console.error('Redis Client Error', err));

export default redis;
