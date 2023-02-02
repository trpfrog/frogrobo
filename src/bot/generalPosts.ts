import { type TwitterApi } from 'twitter-api-v2'
import { FrogRoboID } from './index'
import { weightedRandom } from '../utils'
import { TextGenerator, ReplyGenerator } from '../inference/generation'
import { diffusionQuery } from '../inference/queries'

async function crawlTimeline (client: TwitterApi, options?: { targetMinutes?: number }): Promise<string | null> {
  const { targetMinutes } = options ?? {}
  const targetTime = targetMinutes != null
    ? new Date(Date.now() - targetMinutes * 60 * 1000)
    : null

  const timeline = await client.v2.userTimeline(FrogRoboID, {
    max_results: 15,
    start_time: targetTime?.toISOString()
  })

  const targetTweets = []
  for (const tweet of timeline.tweets) {
    if ([
      tweet.possibly_sensitive,
      tweet.in_reply_to_user_id != null,
      tweet.text.length < 10,
      tweet.text.startsWith('RT @')
    ].some(Boolean)) {
      continue
    }
    tweet.text = tweet.text.replace(/@[a-zA-Z0-9_]+/g, '')
    // eslint-disable-next-line no-irregular-whitespace
    tweet.text = tweet.text.replace(/https?:\/\/[^\s　]+/g, '')
    targetTweets.push(tweet)
  }

  if (targetTweets.length === 0) {
    return null
  }

  const ids = targetTweets.map(tweet => BigInt(tweet.id))
  const minId = ids.reduce((a, b) => a < b ? a : b)
  const maxId = ids.reduce((a, b) => a > b ? a : b)
  const idRange = maxId - minId + 1n
  const probs = ids.map(id => Math.exp(Number((id - minId) / idRange)))

  return weightedRandom(targetTweets, probs).text
}

async function crawlRecentTweet (client: TwitterApi): Promise<string | null> {
  const crawlRangeMinutes = [15, 60, undefined]
  let targetTweet: string | null = null
  for (const m of crawlRangeMinutes) {
    targetTweet = await crawlTimeline(client, { targetMinutes: m })
    if (targetTweet != null) {
      break
    }
  }
  return targetTweet
}

export async function tweetGeneralText (client: TwitterApi): Promise<void> {
  const targetTweet = await crawlRecentTweet(client)

  const generator = targetTweet != null
    ? new ReplyGenerator(targetTweet)
    : new TextGenerator('今から面白いこと言います。')

  const text = await generator.generate()
  await client.v2.tweet(text)
}

export async function tweetDiffusionImage (client: TwitterApi): Promise<void> {
  const targetTweet = 'an icon of trpfrog'
  const imageBase64 = await diffusionQuery(targetTweet)
  const mediaId = await client.v1.uploadMedia(Buffer.from(imageBase64), {
    mimeType: 'image/png'
  })
  await client.v2.tweet('', {
    media: {
      media_ids: [mediaId]
    }
  })
}
