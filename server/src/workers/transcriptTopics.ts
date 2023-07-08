import { Job, UnrecoverableError, Worker } from 'bullmq'
import { TranscriptTopics } from '../models/transcriptTopics';
import { sequelize } from '../models';
import { openai } from '../services/openai';

export const TranscriptTopicsWorker = new Worker('transcriptTopics', async (job) => {
    const { transcript } = job.data

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Return the main topics from the following text: ${transcript}` }],
    });

    if (response.status !== 200) {
        const errorMessage = `Error processing job: ${job.data.id} --- ${response.status}: ${response.statusText}`
        
        console.error(errorMessage)

        if (response.status === 429 || response.status === 500 || response.status === 503) {
            throw new Error(errorMessage)
        } else {
            throw new UnrecoverableError(errorMessage)            
        }
    }

    return { openAIResponse: response.data.choices[0].message.content }
}, {
    connection: {
        port: 6379,
        host: '0.0.0.0'
    },
    limiter: {
        max: 1,
        duration: 30000
    }
}
);
// 
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
