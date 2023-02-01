import * as fs from 'fs'
import { type TweetSearchRecentV2Paginator, type TweetV2, type TweetV2SingleResult, TwitterApi } from 'twitter-api-v2'
import { traceThreadTweets } from '../src/skills/gptReply'
import * as path from 'path'

it('fetches conversation and sort them', async () => {
  const data = fs.readFileSync(path.join(__dirname, 'json/conversation.json'), 'utf8')
  const conversation = JSON.parse(data) as {
    input: TweetV2SingleResult
    root_tweet: TweetV2SingleResult
    search_result: TweetSearchRecentV2Paginator
    expected: TweetV2[]
  }

  const client = new TwitterApi('')

  const singleTweetSpy = jest.spyOn(client.v2, 'singleTweet')
    .mockImplementation(async (id: string) => {
      if (id === conversation.input.data.id) {
        return conversation.input
      }
      if (id === conversation.root_tweet.data.id) {
        return conversation.root_tweet
      }
      throw new Error('unexpected id')
    })
  const searchSpy = jest.spyOn(client.v2, 'search')
    .mockReturnValue(Promise.resolve(conversation.search_result))

  const result = await traceThreadTweets(conversation.input.data.id, client)
  expect(singleTweetSpy).toBeCalledTimes(2)
  expect(searchSpy).toBeCalledTimes(1)
  expect(result).toEqual(conversation.expected)
})