import { type AccountActivityListener, Bot } from '../src/bot'
import { type EventPayload, type TweetCreateEvent } from '../src/bot/eventTypes'

describe('bot', () => {
  let bot: Bot
  beforeEach(() => {
    bot = new Bot()
  })

  it('should be defined', () => {
    expect(bot).toBeDefined()
  })

  const orderCases = [
    { ids: [1, 2, 3], expected: [1, 2, 3] },
    { ids: [0, 1, -1], expected: [0, 1, -100] },
    { ids: [2], expected: [2] }
  ]

  test.each(orderCases)('reply hook', async ({ ids, expected }) => {
    bot = new Bot()
    const payload: EventPayload = {
      for_user_id: '1234567890',
      tweet_create_events: ids.map(e =>
        ({ id: e, text: 'hello', user: { id_str: '123' } } as unknown as TweetCreateEvent)
      )
    }
    const result: number[] = []
    const actions: AccountActivityListener[] = [0, 1, 2, 3, -100].map(e => ({
      onTweetCreated: async (tweet, _) => {
        if (tweet.id === e && e >= 0) {
          result.push(tweet.id)
          return true
        }
        if (e === -100) {
          result.push(-100)
          return true
        }
        return false
      }
    }))

    actions.forEach(e => { bot.addListener(e) })
    await bot.run(payload)

    expect(result).toEqual(expected)
  })

  it('should be set default listener', async () => {
    const fn = jest.fn().mockReturnValue(true)
    bot.addListener({})
    bot.addListener({ onTweetCreated: async () => fn() })
    bot.addListener({ onFollowed: async () => fn() })
    bot.addListener({ onUnfollowed: async () => fn() })
    bot.addListener({ onFavorited: async () => fn() })
    bot.addListener({ onDirectMessaged: async () => fn() })

    const dummyPayload = {
      for_user_id: '1234567890',
      tweet_create_events: [{
        text: 'hello',
        user: { id_str: '123' }
      } as unknown as TweetCreateEvent],
      favorite_events: [{
        text: 'hello',
        user: { id_str: '123' }
      }],
      follow_events: [
        { type: 'follow' },
        { type: 'unfollow' }
      ],
      direct_message_events: [{
        message_create: { sender_id: '123' }
      }]
    } as unknown as EventPayload

    await bot.run(dummyPayload)
    expect(fn).toBeCalledTimes(5)
  })
})
