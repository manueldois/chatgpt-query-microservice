import 'dotenv/config'
import { Sequelize } from "sequelize";
import { app } from "./app";
import { OpenAIApi } from "openai";
import { initSequelize } from "./models";
import { initOpenAI } from './services/openai';

export async function createServer({ sequelize, openai }: { sequelize: Sequelize, openai: OpenAIApi }) {
    try {
        await sequelize.authenticate()
        await initSequelize(sequelize)
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1)
    }

    console.log('Connection to DB has been established successfully.');

    initOpenAI(openai)

    return app.listen(
        3000,
        () => {
            console.log(`Server listening on port 3000`)
        }
    )
}
