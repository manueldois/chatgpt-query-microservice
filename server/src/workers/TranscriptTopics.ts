import { Job, Worker } from 'bullmq'
import crypto from 'crypto'
import { TranscriptTopics } from '../models/TranscriptTopics';
import { sequelize } from '../models';

export const TranscriptTopicsWorker = new Worker('transcriptTopics', async (job) => {
    console.log(job.data.request)


    return "response"
}, {
    connection: { port: 6379, host: '0.0.0.0' }
}
);

TranscriptTopicsWorker.on('completed', async (job: Job, returnvalue: any) => {
    // Do something with the return value.
    console.log("Returns: ", returnvalue)

    const transcriptHash = crypto.createHash('md5').update(job.data.request).digest("hex")

    await sequelize.authenticate()

    await TranscriptTopics.create({
        transcriptHash,
        openAIResponse: returnvalue,
    })

    console.log((await TranscriptTopics.findAll()).map(t => t.dataValues))
});