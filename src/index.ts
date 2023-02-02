import * as ff from '@google-cloud/functions-framework'
import 'dotenv/config'
import { Bot } from './bot'
import actions from './skills'
import { isAccessAllowed, webhookChallenge } from './auth'

async function action (body: any): Promise<void> {
  const bot = new Bot()
}

ff.http('FrogRoboFunction', async (req: ff.Request, res: ff.Response) => {
  if (!isAccessAllowed(req)) {
    res.status(401)
    res.send({ error: 'Unauthorized' })
    return
  }
  console.log(req.params)

  if (req.method === 'GET') {
    webhookChallenge(req, res)
  } else if (req.method === 'POST') {
      actions.forEach(act => { bot.addListener(act) })
      await bot.run(req.body)
  } else {
    res.send({ error: 'Invalid request' })
  }
})
