#!/usr/bin/env bash

gcloud functions deploy tweet \
  --entry-point='FrogRoboFunction' \
  --runtime=nodejs18 \
  --trigger-http \
  --region=asia-northeast1 \
  --project=twitter-frog-robo \
  --timeout=180 \
  --allow-unauthenticated \
  --set-secrets 'HF_TOKEN=HuggingFace:latest,TWITTER_TOKEN_JSON=Twitter:latest,TRPFROG_WEBHOOK_TOKEN=FrogRoboWebhookToken:latest,NG_WORDS=NGWords:latest'
