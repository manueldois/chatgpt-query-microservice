import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export let TranscriptTopics: ModelStatic<Model<any, any>>

export const InitTranscriptTopics = (sequelize: Sequelize) => {
    const Model = sequelize.define('transcriptTopics', {
        jobId: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        error: {
            type: DataTypes.STRING,
        },
        transcriptHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        openAIResponse: {
            type: DataTypes.STRING
        },
    }, {
        indexes: [
            {
                fields: ['transcriptHash'],
                unique: true,
            },
            {
                fields: ['status'],
                unique: false,
            },
        ]
    })

    TranscriptTopics = Model as any

    return TranscriptTopics
}
