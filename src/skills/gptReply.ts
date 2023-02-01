import { type AccountActivityListener } from '../bot'
import { ReplyGenerator } from '../inference/generation'
import { type TweetV2, type TwitterApi } from 'twitter-api-v2'
import { FrogRoboID } from '../bot'

export async function traceThreadTweets (statusId: string, client: TwitterApi): Promise<TweetV2[]> {
  const result = await client.v2.singleTweet(statusId, {
    'tweet.fields': 'conversation_id'
  })
  const conversationId = result?.data?.conversation_id

  if (conversationId == null) {
    return []
  }

  const rootTweet = await client.v2.singleTweet(conversationId)
  const searchResult = await client.v2.search(
    `conversation_id:${conversationId}`,
    {
      'tweet.fields': 'referenced_tweets'
    }
  )

  if (result == null) {
    return []
  }

  const tweets = searchResult.tweets
  tweets.push(rootTweet.data)

  const conversations: TweetV2[] = []

  // follow the root of conversation
  let current: TweetV2 | undefined = tweets.find(e => e.id === statusId)
  while (current != null) {
    conversations.push(current)
    current = tweets.find(e => {
      const referencedTweets = current?.referenced_tweets ?? []
      const nextId = referencedTweets.filter(tw => tw.type === 'replied_to')[0]?.id
      return e.id === nextId
    })
  }
  return conversations.reverse()
}

const gptReply: AccountActivityListener = {
  onTweetCreated: async (tweet, client) => {
    const IGNORE_RATIO = 0.1
    const id = tweet.id_str
    if (Math.random() < IGNORE_RATIO) {
      const threadTweets = await traceThreadTweets(id, client)
      const tweetTexts = threadTweets.map(e => e.text)
      console.log(tweetTexts)

      const replyGenerator = new ReplyGenerator(...tweetTexts)
      const toReply = await replyGenerator.generate()
      console.log('reply: ' + toReply)

      await client.v2.reply(toReply, id)
    } else {
      await client.v2.like(FrogRoboID, id)
    }
    return true
  }
}

export default gptReply
