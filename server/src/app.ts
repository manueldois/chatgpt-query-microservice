import 'dotenv/config'
import './workers/transcriptTopics'
import express from 'express'
import asyncHandler from 'express-async-handler'
import { sequelize } from './models';
import { TranscriptTopics } from './models/transcriptTopics';
import { getTranscript, getTranscriptStatus, getTranscripts, postTranscript } from './controllers/transcripts';

const app: express.Application = express();

app.use(express.json())

app.post('/transcripts', asyncHandler(postTranscript))

app.get('/transcripts', asyncHandler(getTranscripts))

app.get('/transcripts/:id', asyncHandler(getTranscript))

app.get('/transcripts/:id/status', asyncHandler(getTranscriptStatus))

sequelize.authenticate()
    .then(async () => {
        console.log('Connection to DB has been established successfully.');

        await TranscriptTopics.sync()

        app.listen(
            3000,
            () => {
                console.log(`Server listening on port 3000`)
            }
        )

    }).catch((error) => {
        console.error('Unable to connect to the database:', error);
        process.exit(1)
    });



