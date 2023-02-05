import type * as ff from '@google-cloud/functions-framework'
import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'

export function webhookChallenge (req: ff.Request, res: ff.Response): void {
  if ('crc_token' in req.query) {
    const consumerSecret = JSON.parse(process.env.TWITTER_TOKEN_JSON ?? '').consumer_secret ?? ''

    const sha256hashDigest = crypto
      .createHmac('sha256', consumerSecret)
      .update((req.query.crc_token as string) ?? '')
      .digest('base64')

    res.status(StatusCodes.OK)
      .header('Content-Type', 'application/json')
      .send({
        response_token: `sha256=${sha256hashDigest}`
      })
  } else {
    res.send({ error: 'No crc_token provided' })
  }
}

export function isAccessAllowed (req: ff.Request): boolean {
  if ('trpfrog-webhook-token' in req.query) {
    return req.query['trpfrog-webhook-token'] === process.env.TRPFROG_WEBHOOK_TOKEN
  } else {
    return false
  }
}
