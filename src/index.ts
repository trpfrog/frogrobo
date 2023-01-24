import * as ff from '@google-cloud/functions-framework'
import 'dotenv/config'
import * as crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'

function webhookChallenge (req: ff.Request, res: ff.Response): void {
  if (typeof req.params.crc_token !== 'undefined') {
    const consumerSecret = JSON.parse(process.env.TWITTER_TOKEN_JSON ?? '').consumer_secret ?? ''
    const sha256hashDigest = crypto
      .createHmac('sha256', consumerSecret)
      .update(req.body?.crc_token ?? '')
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

ff.http('FrogRoboFunction', async (req: ff.Request, res: ff.Response) => {
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  // const params = req.params
  console.log(req.params)

  if (req.method === 'GET') {
    webhookChallenge(req, res)
  } else if (req.method === 'POST') {
    res.send({ error: 'POST not implemented' })
  } else {
    res.send({ error: 'Invalid request' })
  }
})
