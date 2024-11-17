import { createClient } from 'redis';

export const redis = createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}` 
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis error:', err));

redis.connect().then((data) => console.log(data)).catch(err => console.log(err));
