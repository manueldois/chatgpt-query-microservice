import { DataTypes } from "sequelize";
import { sequelize } from "../services/sequelize";

export const TranscriptTopics = sequelize.define('transcriptTopics', {
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

