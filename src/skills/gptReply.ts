import { type AccountActivityListener } from '../bot'
import { ReplyGenerator } from '../inference/generation'
import { type TweetV2, type TwitterApi } from 'twitter-api-v2'
import { stringNumberCompareFn } from '../utils'

async function fetchThreadTweets (statusId: string, client: TwitterApi): Promise<TweetV2[]> {
  const result = await client.v2.singleTweet(statusId, {
    'tweet.fields': 'conversation_id'
  })
  const conversationId = result?.data?.conversation_id

  if (conversationId != null) {
    const result = await client.search(
      `conversation_id:${conversationId}`
    )
    // sort tweets before statusId
    return result.tweets
      .filter(e => stringNumberCompareFn(e.id, statusId) <= 0)
      .sort((a, b) => stringNumberCompareFn(a.id, b.id))
  } else {
    return []
  }
}

const gptReply: AccountActivityListener = {
  onTweetCreated: async (tweet, client) => {
    const id = tweet.id_str

    const threadTweets = await fetchThreadTweets(id, client)
    const tweetTexts = threadTweets.map(e => e.text)
    console.log(tweetTexts)

    const replyGenerator = new ReplyGenerator(...tweetTexts)
    const toReply = await replyGenerator.generate()
    console.log('reply: ' + toReply)

    await client.v2.reply(toReply, id)
    return true
  }
}

export default gptReply