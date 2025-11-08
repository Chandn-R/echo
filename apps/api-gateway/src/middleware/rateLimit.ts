import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { createClient, RedisClientType } from 'redis'

export const redisClient: RedisClientType = createClient()

redisClient.on('error', (err) => {
    console.error('Redis Client Error: \n', err);
});

export async function connectDb() {
    try {
        await redisClient.connect()
        console.log("Connected to Redis successfully \n");
    } catch (error) {
        console.error(' Could not connect to Redis: \n', error);
    }
}

export function createRateLimiter() {
    return rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 25,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        }),
    })
}