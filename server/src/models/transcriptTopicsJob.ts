import { DataTypes } from "sequelize";
import { sequelize } from "../services/sequelize";

export const TranscriptTopicsJob = sequelize.define('transcriptTopicsJob', {
    jobId: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ['PENDING', 'COMPLETE', 'ERROR'],
        defaultValue: 'PENDING'
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

