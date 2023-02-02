import { TwitterApi } from 'twitter-api-v2'
import type * as ev from './eventTypes'
import 'dotenv/config'
import { asyncFilter } from '../utils'
import { type AccountActivityListener } from './listener'
import { createTwitterAdapter, type SocialAdapter } from './socialAdapter'
import { tweetDiffusionImage, tweetGeneralText } from './generalPosts'

export type { AccountActivityListener } from './listener'

const TWITTER_TOKEN_JSON = JSON.parse(process.env.TWITTER_TOKEN_JSON ?? '')
export const FrogRoboID = '2744579940'
export const TrpFrogID = '92482871'

export class Bot {
  private readonly client: TwitterApi
  private readonly listeners: Array<Required<AccountActivityListener>>
  public readonly userId: string
  private readonly socialAdapter: SocialAdapter<TwitterApi>

  /**
   * Create a new bot.
   */
  constructor () {
    const token = JSON.parse(process.env.TWITTER_TOKEN_JSON!)
    // delete x.bearer_token
    this.client = new TwitterApi({
      appKey: token.consumer_key,
      appSecret: token.consumer_secret,
      accessToken: token.access_token,
      accessSecret: token.access_token_secret
    })
    this.listeners = []
    this.userId = '2744579940'
    this.socialAdapter = createTwitterAdapter(this.client)
  }

  /**
   * Add a listener to the bot.
   * @param listener The listener to add.
   */
  public addListener (listener: AccountActivityListener): void {
    this.listeners.push({
      onTweetCreated: async () => false,
      onDirectMessaged: async () => false,
      onFollowed: async () => false,
      onUnfollowed: async () => false,
      onFavorited: async () => false,
      ...listener
    })
  }

  public async tweetGenerally (): Promise<void> {
    const IMAGE_RATIO = 0.1
    const rand = Math.random()
    if (rand < IMAGE_RATIO) {
      await tweetDiffusionImage(this.client)
    } else {
      await tweetGeneralText(this.client)
    }
  }

  /**
   * Run the bot with the given event payload.
   * If a listener returns true, the bot will stop running for the event.
   * @param eventPayload The event payload.
   */
  public async run (eventPayload: ev.EventPayload): Promise<void> {
    for (const listener of this.listeners) {
      if (eventPayload.tweet_create_events != null) {
        eventPayload.tweet_create_events = await asyncFilter(
          eventPayload.tweet_create_events
            .filter(e => e.user.id_str !== this.userId)
            .filter(e => !e.text.trim().startsWith('RT @')),
          async e => (
            !await listener.onTweetCreated(e, this.socialAdapter)
          )
        )
      }
      if (eventPayload.favorite_events != null) {
        eventPayload.favorite_events = await asyncFilter(
          eventPayload.favorite_events.filter(e => e.user.id_str !== this.userId),
          async e => (
            !await listener.onFavorited(e, this.socialAdapter)
          )
        )
      }
      if (eventPayload.follow_events != null) {
        eventPayload.follow_events = await asyncFilter(
          eventPayload.follow_events, async e => {
            if (e.type === 'follow') {
              return !await listener.onFollowed(e, this.socialAdapter)
            } else {
              return !await listener.onUnfollowed(e, this.socialAdapter)
            }
          }
        )
      }
      if (eventPayload.direct_message_events != null) {
        eventPayload.direct_message_events = await asyncFilter(
          eventPayload.direct_message_events.filter(e => e.message_create.sender_id !== this.userId),
          async e => (
            !await listener.onDirectMessaged(e, this.socialAdapter)
          )
        )
      }
    }
  }
}
