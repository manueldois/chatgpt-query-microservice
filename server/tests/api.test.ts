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

const maxAttempts = parseInt(process.env.JOB_MAX_ATTEMPTS as string, 10)
const delay = parseInt(process.env.JOB_BACKOFF_DELAY as string, 10)
const jobSpacingMS = 1000 / parseInt(process.env.JOB_MAX_REQUESTS_PER_SEC as string, 10)
const timeToDoMaxAttempts = 2 ** (maxAttempts - 1) * delay

describe('API tests', () => {
  beforeEach(async () => {
    await TranscriptTopics.destroy({ where: {} })
    vi.resetAllMocks()
  })

  it('Responds with 400 on POST /transcript without transcript body', async () => {
    const res = await request(app).post('/transcripts')
      .send({ notATranscript: 'void' })
    expect(res.statusCode).toBe(400)
  })

  it('Responds with 404 on GET /transcript/:id for missing ids', async () => {
    const res = await request(app).get('/transcript/1000')
    expect(res.status).toBe(404)
  })

  it('Responds with 404 on GET /transcript/:id/status for missing ids', async () => {
    const res = await request(app).get('/transcript/status/1000')
    expect(res.status).toBe(404)
  })

  it(`Returns the same job if an equal transcript was already seen`, async () => {
    (openai.createChatCompletion as Mock).mockImplementation(async () => {
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

    const resPostFirst = await request(app)
      .post('/transcripts')
      .send({ transcript: "This is a text about apples" })

    await setTimeoutAsync(200)

    const resGetFirst = await request(app).get(`/transcripts/${resPostFirst.body.id}`)
    expect(resGetFirst.body).toMatchObject({ status: 'COMPLETE' })

    const resPostSecond = await request(app)
      .post('/transcripts')
      .send({ transcript: "This is a text about apples" })

    expect(resPostSecond.body.id).toBe(resPostFirst.body.id)

    expect((openai.createChatCompletion as Mock)).toHaveBeenCalledTimes(1)
  })

  it(`Fails the job if an unrecoverable error was thrown from OpenAI`, async () => {
    (openai.createChatCompletion as Mock).mockImplementation(async () => {
      await setTimeoutAsync(100)
      return (
        {
          status: 401,
          data: {}
        }
      )
    })

    const resPost = await request(app)
      .post('/transcripts')
      .send({ transcript: "This is a text about apples" })

    await setTimeoutAsync(200)

    const resGet = await request(app).get(`/transcripts/${resPost.body.id}`)
    expect(resGet.body).toMatchObject({ status: 'ERROR' })

    expect((openai.createChatCompletion as Mock)).toHaveBeenCalledOnce()
  })

  it(`Retries the job up to ${process.env.JOB_MAX_ATTEMPTS} times if a recoverable error is thrown from OpenAI`, async () => {
    let calls = 0;

    (openai.createChatCompletion as Mock).mockImplementation(async () => {
      calls++
      await setTimeoutAsync(1)

      if (calls >= maxAttempts) {
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
          }
        )
      }

      return (
        {
          status: 429,
        }
      )
    })

    const resPost = await request(app)
      .post('/transcripts')
      .send({ transcript: "This is a text about apples" })

    await setTimeoutAsync(timeToDoMaxAttempts + 1000)

    const resGet = await request(app).get(`/transcripts/${resPost.body.id}`)
    expect(resGet.body).toMatchObject({ status: 'COMPLETE' })

    expect((openai.createChatCompletion as Mock)).toHaveBeenCalledTimes(maxAttempts)
  },
    timeToDoMaxAttempts + 2000
  )

  it(`Spaces the requests to OpenAI to a max of ${process.env.JOB_MAX_REQUESTS_PER_SEC} per sec.`, async () => {
    const callTimestampsMS: number[] = [];

    (openai.createChatCompletion as Mock).mockImplementation(async () => {
      callTimestampsMS.push(Date.now())

      await setTimeoutAsync(1)

      return {
        status: 200,
        data: {
          choices: [{
            message: {
              content: 'ChatGPT Response'
            }
          }]
        }
      }
    }
    )

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/transcripts')
        .send({ transcript: "This is a text about apples " + i })
    }

    await setTimeoutAsync(1200)

    const resGet = await request(app).get(`/transcripts`)

    resGet.body.map(job => expect(job).toMatchObject({ status: 'COMPLETE' }))

    expect((openai.createChatCompletion as Mock)).toHaveBeenCalledTimes(5)

    const callSpacingMS = callTimestampsMS
      .map((n, i, arr) => ([n, arr[i + 1]]))
      .slice(0, -1)
      .map(([n1, n2]) => n2 - n1)

    callSpacingMS.map((ms) => expect(ms).toBeGreaterThanOrEqual(
      jobSpacingMS
    ))
  })

  it(`Creates a job, then first gets it with {status: queued}, then with {status: complete}`, async () => {
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
        }
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