# Hangbank
"Hangbank" refers to a storage of audio-text pairs that will be able to train TTS Engines. Training a TTS Engine requires a corpus (some text files) and audio files paired to them (user reads it out loud).

# Important Note
This is an experimental version and may contain some bugs.
Feel free to reach out reporting the issues.

# Installation
Firstly, clone this repository via the following command:\
`git clone https://github.com/Szombatioi/hangbank.git`

## Setup MinIO
Have a docker compose file ready with this content in the root folder ("hangbank" folder):

docker-compose.yml
``` yaml
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    container_name: minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Web Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes:
      - minio_data:/data

volumes:
  minio_data:

```

Then run: 
`$ docker compose up -d`


You can view your Object Storage at `http://localhost:9001/`

Log in via admin credentials: \
`Username: minioadmin`   
`Password: minioadmin123`

## Create PostgreSQL Database
Use this command: `$ docker run --name dev-hangbank -e POSTGRES_USER=hangbank -e POSTGRES_PASSWORD=hangbank -e POSTGRES_DB=hangbank_dev -p 5432:5432 -d postgres`

Make sure that USERNAME and PASSWORD are set to "hangbank".

This database will store our database entities.

## Start Backend
Go to the `hangbank_server` folder and run the following commands to start developer mode:\
 `npm i`

This installs the dependencies. Then create a .env file in the current folder (hangbank_server) with the following content:
`MINIO_ENDPOINT=localhost`
`MINIO_PORT=9000`
`MINIO_ACCESS_KEY=minioadmin`
`MINIO_SECRET_KEY=minioadmin123`
`MINIO_PUBLIC_URL=http://localhost:9001`

`DB_HOST=localhost`
`DB_PORT=5432`
`DB_USER=hangbank`
`DB_PASS=hangbank`
`DB_NAME=hangbank_dev`

`JWT_SECRET=<your-jwt-secret>`

Note that you'll need to generate a JWT secret. You can do this by any jwt secret generator, for example: https://jwtsecrets.com/
(Make sure it is at least 64 characters [256 bits] long)

The you can start the backend via:
 `npm run start:dev`

## Start Frontend
In another terminal, go into the `hangbank_ui` folder and run:\
`npm i`

This will install dependencies. Then create a .env file in the current folder (hangbank_ui) with the following content:
`NEXT_PUBLIC_NEST_API_URL=http://localhost:3001`
`NEXT_PUBLIC_GEMINI_API_KEY=<your_api_key>`

Note that you'll need a Gemini API key to work, you can generate this on the Gemini API.

Then you can start the frontend via:\
`npm run dev`

# Start using the app
Open your browser at `localhost:3000` and log in with the default admin credentials:\
`Email: admin@gmail.com`\
`Password: admin`

## How to use the app
On the home page you can:
1. Upload a corpus for corpus based recordings (txt, pdf and docx formats)
2. Create a new dataset (Corpus based and Conversational based types)
3. View your saved datasets

To record, open a dataset and:\
a. Corpus based: Start reading the text on the screen. To go the the next block, press space. To save progress, stop recording with the stop recording button, and click on the save button on the top right.\
b. Conversation based: Choose a topic and record your answer to the ai chat. Press space to send your response. To save, press the save button on the top right.

## Audio blocks quality
If a corpus block's recorded audio has issues (too noisy, too loud etc.) there will be an yellow indicator on the dataset overview in the proper corpus block card.
