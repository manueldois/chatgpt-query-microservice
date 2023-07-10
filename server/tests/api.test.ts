import 'dotenv/config'
import { describe, it, vi } from 'vitest';
import request from 'supertest'
import { createApp } from '../src/app'
import { sequelize } from '../src/services/sequelize';

vi.mock('../src/services/sequelize', async () => {
  const { Sequelize } = await import('sequelize');
  return { sequelize: new Sequelize('sqlite::memory:') }
})

const app = await createApp()

describe('API tests', () => {
  it('Gets transcripts', async () => {

    await request(app).post('/transcripts').send({ transcript: "This is a text about apples" })

    const res = await request(app).get('/transcripts')

    console.log(res.body)
  })
})