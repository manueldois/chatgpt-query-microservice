import 'dotenv/config'
import './workers/transcriptTopics'
import express from 'express'
import asyncHandler from 'express-async-handler'
import { getTranscriptTopicJob, getTranscriptTopicStatus, getTranscriptTopicJobs, postTranscriptTopicsJob } from './controllers/transcriptTopicsJob';
import { TranscriptTopicsJob } from './models/transcriptTopicsJob';
import { sequelize } from './services/sequelize';

export async function createApp() {
    try {
        await sequelize.authenticate()
        await TranscriptTopicsJob.sync()
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1)
    }

    console.log('Connection to DB has been established successfully.');

    const app: express.Application = express();

    app.use(express.json())

    app.post('/transcript-topics-job', asyncHandler(postTranscriptTopicsJob))

    app.get('/transcript-topics-job', asyncHandler(getTranscriptTopicJobs))

    app.get('/transcript-topics-job/:id', asyncHandler(getTranscriptTopicJob))

    app.get('/transcript-topics-job/:id/status', asyncHandler(getTranscriptTopicStatus))

    return app
}