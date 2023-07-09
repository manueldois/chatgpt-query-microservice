# Code test - ChatGPT querying microservice

## Functionalities

- Accepts a chunk of unstructured text Sample text
- Sends it to ChatGPT asking to return the main topics
- Will at a maximum rate send 5 requests per second
- Writes the response to permanent storage
- Reuses responses to the OpenAI API when duplicates are requested
- Allows querying the status of each request e.g. queued, complete, error

## Tech stack

- Docker
- NodeJS (Typescript)
- SQLite
- BullMQ

## Usage

The project requires an OpenAI API key

`echo <OPENAI_API_KEY> > ./secrets/openai_api_key.txt `

`docker-compose -f docker-compose.yml up`

## Endpoints

Default port `3000`

- `POST /transcripts: ` `{"transcript": "<transcript text>"}`   Adds a transcript job
- `GET /transcripts`    Gets all transcript jobs
- `GET /transcripts/:id`    Gets transcript job per id
- `GET /transcripts/:id/status`    Gets transcript job per id, only status

## Dev notes

For storage I'm using SQLite while keeping the data in a persistent volume `db`.
This is simple and sufficient as this service will always be running single, with only one connection.

For the queue, I'm using BullMQ as it's unnecessary to roll out my own implementation.

### Dev workflow

`cp server/.env.example server/.env`

`docker-compose -f docker-compose.dev.yml up`

`cd server && npm run dev:debug`

(or use vscode debug console to launch and attach to server)