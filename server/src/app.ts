import 'dotenv/config'
import './workers/transcriptTopics'
import express from 'express'
import asyncHandler from 'express-async-handler'
import { getTranscript, getTranscriptStatus, getTranscripts, postTranscript } from './controllers/transcripts';
import { DependenciesContainer, setContainer, container } from './container';

export async function createApp(injectedContainer?: DependenciesContainer) {
    if (injectedContainer) {
        setContainer(injectedContainer)
    }

    const sequelize = container.resolve('sequelize')
    const TranscriptTopics = container.resolve('TranscriptTopics')

    try {
        await sequelize.authenticate()
        await TranscriptTopics.sync()
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1)
    }

    console.log('Connection to DB has been established successfully.');

    const app: express.Application = express();

    app.use(express.json())

    app.post('/transcripts', asyncHandler(postTranscript))

    app.get('/transcripts', asyncHandler(getTranscripts))

    app.get('/transcripts/:id', asyncHandler(getTranscript))

    app.get('/transcripts/:id/status', asyncHandler(getTranscriptStatus))

    return app
}