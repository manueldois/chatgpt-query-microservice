import express from 'express'
import asyncHandler from 'express-async-handler'
import { sequelize } from './models';
import { TranscriptTopics } from './models/TranscriptTopics';
import { TranscriptTopicsQueue } from './queues/TranscriptTopics'
import './workers/TranscriptTopics'

const app: express.Application = express();

app.use(express.json())

app.post('/transcripts', asyncHandler(async (req, res, next) => {
    const { transcript } = req.body

    if (!transcript || typeof transcript !== 'string') {
        throw new Error('Missing transcript')
    }

    TranscriptTopicsQueue.add('transcript', { request: req.body.transcript })

    res.sendStatus(200)
}))

sequelize.authenticate()
    .then(async () => {
        console.log('Connection has been established successfully.');
        await TranscriptTopics.sync({ force: true })
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



