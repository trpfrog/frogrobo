#!/usr/bin/env bash

SECRET_ENV="HF_TOKEN=HuggingFace:latest"
SECRET_ENV="$SECRET_ENV,TWITTER_TOKEN_JSON=Twitter:latest"
SECRET_ENV="$SECRET_ENV,TRPFROG_WEBHOOK_TOKEN=FrogRoboWebhookToken:latest"
SECRET_ENV="$SECRET_ENV,NG_WORDS=NGWords:latest"

gcloud functions deploy tweet \
  --entry-point='FrogRoboFunction' \
  --runtime=nodejs18 \
  --trigger-http \
  --region=asia-northeast1 \
  --project=twitter-frog-robo \
  --timeout=180 \
  --allow-unauthenticated \
  --clear-env-vars \
  --set-secrets $SECRET_ENV
