import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export let TranscriptTopics: ModelStatic<Model<any, any>>

export const CreateTranscriptTopics = (sequelize: Sequelize) => {
    const Model = sequelize.define('transcriptTopics', {
        transcriptHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        openAIResponse: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        indexes: [
            {
                fields: ['transcriptHash'],
                unique: true,
            },
        ]
    })

    TranscriptTopics = Model as any

    return TranscriptTopics
}
