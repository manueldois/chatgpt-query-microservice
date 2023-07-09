import { Configuration, OpenAIApi } from 'openai'
import fs from 'fs'

const configuration = new Configuration({
    apiKey: fs.readFileSync(process.env.OPENAI_API_KEY_FILE).toString(),
});

export const openai = new OpenAIApi(configuration);
