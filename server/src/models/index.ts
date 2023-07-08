import { Sequelize } from "sequelize";
import path from 'path'
import { CreateTranscriptTopics } from "./TranscriptTopics";

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../db.sqlite')
});

CreateTranscriptTopics(sequelize)
