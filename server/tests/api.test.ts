import 'dotenv/config'
import { describe, it } from 'vitest';
import request from 'supertest'
import { createApp } from '../src/app'

const app = await createApp()

describe('API tests', () => {
  it('Gets transcripts', () => {
    request(app).get('/transcripts').expect(200)
  })
})