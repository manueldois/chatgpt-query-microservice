# Code test - ChatGPT querying microservice

## Functionalities

- Accepts a chunk of unstructured text Sample text (transcript)
- Sends it to ChatGPT asking to return the main topics
- Will at a maximum rate send 5 requests per second
- Writes the response to permanent storage
- Reuses responses to the OpenAI API when duplicates are requested
- Allows querying the status of each request e.g. queued, complete, error

## Dev notes

For storage I'm using SQLite while keeping the data in a persistent volume `db`.
This is simple and sufficient as this service will always be running single.

The transcript is not stored to DB. Only it's hash to compare duplicates for memoization.

For the queue, I'm using BullMQ as it provides all necessary functionalities, and it's unnecessary to roll out my own implementation.

Vitest is used to provide extensive integration test coverage

## Tech stack

- Docker
- NodeJS (Typescript)
- SQLite
- BullMQ
- Redis
- Vitest

## Usage

The project requires an OpenAI API key

`mkdir secrets && echo "<OPENAI_API_KEY>" > ./secrets/openai_api_key.txt `

`docker-compose -f docker-compose.yml up`

## Endpoints

Default port `3000`

- `POST /transcripts: ` `{"transcript": "<transcript text>"}` Adds a transcript job
- `GET /transcripts` Gets all transcript jobs
- `GET /transcripts/:id` Gets transcript job per id
- `GET /transcripts/:id/status` Gets transcript job per id, only status

## Dev workflow

`cp server/.env.example server/.env`

`docker-compose -f docker-compose.dev.yml up`

`cd server && npm i && npm run dev:debug`

## Tests

Testing does NOT require an OpenAI API key

`cd server && npm i && npm run dev:test`

(or use vscode debug console to launch and attach to server)
