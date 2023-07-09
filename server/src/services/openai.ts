import { OpenAIApi } from 'openai'

export let openai: OpenAIApi

export function initOpenAI(_openAI: OpenAIApi){
    openai = _openAI
}
