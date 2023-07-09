import fs from 'fs';
import path from "path";
import { createContainer, InjectionMode, asFunction, AwilixContainer } from "awilix";
import { Configuration, OpenAIApi } from "openai";
import { Model, ModelStatic, Sequelize } from "sequelize";
import { createTranscriptTopics } from './models/transcriptTopics';

export interface Cradle {
    sequelize: Sequelize,
    openai: OpenAIApi,
    TranscriptTopics: ModelStatic<Model<any, any>>
}

export let container = createContainer<Cradle>({
    injectionMode: InjectionMode.CLASSIC
})

export function setContainer(_container: AwilixContainer<Cradle>) {
    container = _container
}

export type DependenciesContainer = typeof container

container.register({
    sequelize: asFunction(createSequelize).singleton(),
    openai: asFunction(createOpenAiAPI).singleton(),
    TranscriptTopics: asFunction(createTranscriptTopics).singleton()
})

function createSequelize() {
    return new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../data/db.sqlite'),
        logging: false,
    });
}

function createOpenAiAPI() {
    const openAiConfig = new Configuration({
        apiKey: fs.readFileSync(process.env.OPENAI_API_KEY_FILE).toString(),
    });

    return new OpenAIApi(openAiConfig);
}