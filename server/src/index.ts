import 'dotenv/config'
import path from "path";
import fs from 'fs'
import { createServer } from "./server";
import { Sequelize } from "sequelize";
import { Configuration, OpenAIApi } from 'openai'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/db.sqlite'),
    logging: false,
});

const openAiConfig = new Configuration({
    apiKey: fs.readFileSync(process.env.OPENAI_API_KEY_FILE).toString(),
});

const openai = new OpenAIApi(openAiConfig);

createServer({ sequelize, openai })
