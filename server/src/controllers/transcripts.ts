import { container } from "../container"
import { TranscriptTopicsQueue } from "../queues/transcriptTopics"
import { hashTranscript } from "../services/transcriptTopics"

export const postTranscript = async (req, res) => {
    // There is no concurrency protection for this endpoint
    // There could be, but implementation depends on the database,
    // and it's probably unnecessary for such a simple service

    const TranscriptTopics = container.resolve('TranscriptTopics')

    const { transcript } = req.body

    if (!transcript || typeof transcript !== 'string') {
        throw new Error('Missing transcript')
    }

    const transcriptHash = hashTranscript(transcript)

    const transcriptWithSameHash = await TranscriptTopics.findOne({ where: { transcriptHash } })

    if (transcriptWithSameHash) {
        res.json(transcriptWithSameHash.dataValues)
        return
    }

    const transcriptDoc = await TranscriptTopics.create({
        transcriptHash,
        status: "QUEUED"
    })

    const job = await TranscriptTopicsQueue.add('transcript', { transcript, id: transcriptDoc.dataValues.id })

    await transcriptDoc.update({ jobId: job.id })

    res.json(transcriptDoc.dataValues)
}

export const getTranscripts = async (req, res) => {
    const TranscriptTopics = container.resolve('TranscriptTopics')

    const transcripts = await TranscriptTopics.findAll({})

    res.json(transcripts)
}

export const getTranscript = async (req, res) => {
    const { id } = req.params

    const TranscriptTopics = container.resolve('TranscriptTopics')

    const transcript = await TranscriptTopics.findOne({ where: { id } })

    if (!transcript) {
        res.sendStatus(404)
    }

    res.json(transcript)
}

export const getTranscriptStatus = async (req, res) => {
    const { id } = req.params

    const TranscriptTopics = container.resolve('TranscriptTopics')

    const transcript = await TranscriptTopics.findOne({ where: { id } })

    if (!transcript) {
        res.sendStatus(404)
    }

    res.json({ status: transcript.dataValues.status })
}