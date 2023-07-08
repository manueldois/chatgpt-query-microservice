import { Queue } from "bullmq";

export const TranscriptTopicsQueue = new Queue('transcriptTopics', {
    connection: {
        port: parseInt(process.env.REDIS_PORT),
        host: process.env.REDIS_HOST
    },
    defaultJobOptions: {
        attempts: parseInt(process.env.JOB_MAX_ATTEMPTS, 10),
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});
