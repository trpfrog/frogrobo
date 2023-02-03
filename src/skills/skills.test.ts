import * as fs from 'fs'
import {
  type TweetSearchRecentV2Paginator,
  type TweetV1,
  type TweetV2,
  type TweetV2SingleResult,
  TwitterApi
} from 'twitter-api-v2'
import gptReply, { traceThreadTweets } from './gptReply'
import actions from './index'
import songwhipReply from './songwhip'
import { debugAdapter } from '../bot/socialResponse'

it('fetches conversation and sort them', async () => {
  const data = fs.readFileSync('fixtures/conversation.json', 'utf8')
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

test('gptReply should be the last one', () => {
  expect(actions[actions.length - 1]).toBe(gptReply)
})

test('songwhip returns a valid url', async () => {
  const url = 'https://music.line.me/webapp/album/mb0000000001d8d85a'
  const tweet = {
    id_str: '1234567890',
    text: `#nowPlaying ${url} @FrogRobo`
  } as unknown as TweetV1

  const printed: string[] = []
  const spy = jest.spyOn(console, 'log').mockImplementation(x => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    printed.push(`${x}`)
  })
  await (songwhipReply.onTweetCreated ?? (() => {}))(tweet, debugAdapter as any)

  const composer = 'ねぎ一世'
  const title = 'つまみのうた (feat. 東北ずん子)'
  const encodedTitle = encodeURIComponent('つまみのうた-feat-東北ずん子')
  const songwhipUrl = `https://songwhip.com/${encodeURIComponent(composer)}/${encodedTitle}`

  expect(printed).toEqual([
    `reply to 1234567890: 🎵 ${composer} - ${title}\n${songwhipUrl}`
  ])
  spy.mockRestore()
})
