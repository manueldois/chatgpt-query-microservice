import { Sequelize } from "sequelize";
import path from 'path'
import { InitTranscriptTopics } from "./transcriptTopics";

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../db.sqlite'),
    logging: false,
});

InitTranscriptTopics(sequelize)
