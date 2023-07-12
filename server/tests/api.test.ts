import 'dotenv/config'
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest'
import { createApp } from '../src/app'
import { TranscriptTopics } from '../src/models/transcriptTopics';
import { openai } from '../src/services/openai';
import { CreateChatCompletionResponse } from 'openai';
import { AxiosResponse } from 'axios'
import { promisify } from 'util'

const setTimeoutAsync = promisify(setTimeout)

vi.mock('../src/services/sequelize', async () => {
  const { Sequelize } = await import('sequelize');
  return { sequelize: new Sequelize('sqlite::memory:', { logging: false }) }
})

vi.mock('../src/services/openai', async () => {
  const { openai } = await import('../src/services/openai');
  return {
    openai: {
      ...openai,
      createChatCompletion: vi.fn()
    }
  }
})

const app = await createApp()

describe('API tests', () => {
  beforeEach(async () => {
    await TranscriptTopics.destroy({ where: {} })
  })

  it(
    `Creates a transcript topics job, then first gets it with status: queued, 
  then with status: complete and topics from ChatGPT`,
    async () => {
      (openai.createChatCompletion as Mock).mockImplementationOnce(async () => {
        await setTimeoutAsync(100)
        return (
          {
            status: 200,
            data: {
              choices: [{
                message: {
                  content: 'ChatGPT Response'
                }
              }]
            }
          } as AxiosResponse<CreateChatCompletionResponse, any>
        )
      })

      await request(app)
        .post('/transcripts')
        .send({ transcript: "This is a text about apples" })

      const resQueued = await request(app).get('/transcripts')

      expect(resQueued.body).toHaveLength(1)
      expect(resQueued.body[0]).toMatchObject({ status: 'QUEUED' })

      await setTimeoutAsync(200)

      const resComplete = await request(app).get(`/transcripts/${resQueued.body[0].id}`)

      expect(resComplete.body).toMatchObject({ status: 'COMPLETE', openAIResponse: 'ChatGPT Response' })

      const resCompleteStatus = await request(app).get(`/transcripts/${resQueued.body[0].id}/status`)

      expect(resCompleteStatus.body).toMatchObject({ status: 'COMPLETE' })
    })
})