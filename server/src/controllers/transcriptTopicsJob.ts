import { TranscriptTopicsJob } from "../models/transcriptTopicsJob"
import { TranscriptTopicsQueue } from "../queues/transcriptTopics"
import { hashTranscript } from "../services/transcriptTopics"

export const postTranscriptTopicsJob = async (req, res) => {
    // There is no concurrency protection for this endpoint
    // There could be, but implementation depends on the database,
    // and it's probably unnecessary for such a simple service

    const { transcript } = req.body

    if (!transcript || typeof transcript !== 'string') {
        res.sendStatus(400)
        return
    }

    const transcriptHash = hashTranscript(transcript)

    const transcriptTopicJobWithSameHash = await TranscriptTopicsJob.findOne({ where: { transcriptHash } })

    if (transcriptTopicJobWithSameHash) {
        res.json(transcriptTopicJobWithSameHash.dataValues)
        return
    }

    const transcriptTopicJob = await TranscriptTopicsJob.create({
        transcriptHash,
        status: "QUEUED"
    })

    const job = await TranscriptTopicsQueue.add('transcript', { transcript, id: transcriptTopicJob.dataValues.id })

    await transcriptTopicJob.update({ jobId: job.id })

    res.json(transcriptTopicJob.dataValues)
}

export const getTranscriptTopicJobs = async (req, res) => {
    const transcriptTopicJobs = await TranscriptTopicsJob.findAll({})

    res.json(transcriptTopicJobs)
}

export const getTranscriptTopicJob = async (req, res) => {
    const { id } = req.params

    const transcriptTopicJob = await TranscriptTopicsJob.findOne({ where: { id } })

    if (!transcriptTopicJob) {
        res.sendStatus(404)
        return
    }

    res.json(transcriptTopicJob)
}

export const getTranscriptTopicStatus = async (req, res) => {
    const { id } = req.params

    const transcriptTopicJob = await TranscriptTopicsJob.findOne({ where: { id } })

    if (!transcriptTopicJob) {
        res.sendStatus(404)
        return
    }

    res.json({ status: transcriptTopicJob.dataValues.status })
}