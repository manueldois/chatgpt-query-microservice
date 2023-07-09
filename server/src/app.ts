import './workers/transcriptTopics'
import express from 'express'
import asyncHandler from 'express-async-handler'
import { getTranscript, getTranscriptStatus, getTranscripts, postTranscript } from './controllers/transcripts';

const app: express.Application = express();

app.use(express.json())

app.post('/transcripts', asyncHandler(postTranscript))

app.get('/transcripts', asyncHandler(getTranscripts))

app.get('/transcripts/:id', asyncHandler(getTranscript))

app.get('/transcripts/:id/status', asyncHandler(getTranscriptStatus))

export { app }
