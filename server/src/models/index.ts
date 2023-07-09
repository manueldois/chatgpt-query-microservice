import { Sequelize } from "sequelize";
import { initTranscriptTopics, TranscriptTopics } from "./transcriptTopics";

export let sequelize: Sequelize

export async function initSequelize(_sequelize: Sequelize) {
    sequelize = _sequelize

    initTranscriptTopics(_sequelize)

    await TranscriptTopics.sync()
}
