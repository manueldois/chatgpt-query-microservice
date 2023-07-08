import { Queue } from "bullmq";

export const TranscriptTopicsQueue = new Queue('transcriptTopics', {
    connection: { port: 6379, host: '0.0.0.0' }
});
