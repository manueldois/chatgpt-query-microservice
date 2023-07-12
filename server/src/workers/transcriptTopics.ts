import { Job, UnrecoverableError, Worker } from 'bullmq'
import { TranscriptTopics } from '../models/transcriptTopics';
import { openai } from '../services/openai';
import { sequelize } from '../services/sequelize';

export const TranscriptTopicsWorker = new Worker('transcriptTopics', async (job) => {
    const { transcript } = job.data

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Return the main topics from the following text: ${transcript}` }],
    });

    if (response.status !== 200) {
        const errorMessage = `Error processing job: ${job.data.id} --- Status code: ${response.status}`

        console.error(errorMessage)

        const unrecoverableErrors = [401, 500, 503]

        if (unrecoverableErrors.includes(response.status)) {
            throw new UnrecoverableError(errorMessage)
        } else {
            throw new Error(errorMessage)
        }
    }

    return { openAIResponse: response.data.choices[0].message.content }
}, {
    connection: {
        port: parseInt(process.env.REDIS_PORT, 10),
        host: process.env.REDIS_HOST
    },
    limiter: {
        max: 1,
        // Add an error margin of 10% bellow max requests
        duration: 1.1 * (1000 / parseInt(process.env.JOB_MAX_REQUESTS_PER_SEC, 10))
    }
}
);

TranscriptTopicsWorker.on('completed', async (job: Job, { openAIResponse }: { openAIResponse: string }) => {
    try {
        await sequelize.authenticate()

        await TranscriptTopics.update({
            jobId: job.id,
            openAIResponse: openAIResponse,
            status: "COMPLETE"
        }, {
            where: {
                id: job.data.id
            }
        })
    } catch (error) {
        console.error(error)
    }
});

TranscriptTopicsWorker.on('failed', async (job: Job, error: Error) => {
    try {
        await sequelize.authenticate()

        await TranscriptTopics.update({
            jobId: job.id,
            status: "ERROR",
            error: error.message
        }, {
            where: {
                id: job.data.id
            }
        })
    } catch (error) {
        console.error(error)
    }
});

