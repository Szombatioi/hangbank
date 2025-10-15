# hangbank
"Hangbank" refers to a storage of audio-text pairs that will be able to train TTS Engines. Training a TTS Engine requires a corpus (some text files) and audio files paired to them (user reads it out loud).

# Setup MinIO
Have a docker compose file ready with this content:

docker-compose.yml
> version: '3.8' \
services: \
&ensp;&ensp;minio:\
&ensp;&ensp;image: minio/minio:latest\
&ensp;&ensp;container_name: minio\
&ensp;&ensp;command: server /data --console-address ":9001"\
&ensp;&ensp;ports:\
&ensp;&ensp;&ensp;- "9000:9000"   # S3 API\
&ensp;&ensp;&ensp;- "9001:9001"   # Web Console\
&ensp;&ensp;environment:\
&ensp;&ensp;&ensp;MINIO_ROOT_USER: minioadmin\
&ensp;&ensp;&ensp;MINIO_ROOT_PASSWORD: minioadmin123\
&ensp;&ensp;volumes:\
&ensp;&ensp;&ensp;- minio_data:/data \
volumes: \
&ensp;&ensp;minio_data:

Then run: 
`$ docker compose up -d`


You can view your Object Storage at `http://localhost:9001/`

After logging in via admin credentials, you can create your bucker. Name it e.g. `mybucket`.

# Create PostgreSQL Database
Use this command: `$ docker run --name dev-hangbank -e POSTGRES_USER=<USERNAME> -e POSTGRES_PASSWORD=<PASSWORD> -e POSTGRES_DB=hangbank_dev -p 5432:5432 -d postgres`

Make sure that USERNAME and PASSWORD are set to "hangbank".

# Start Backend
Go to the `hangbank_server` folder and run: `npm run start`. \
To run in developer mode, run: 
`npm run start:dev`