import { TwitterApi } from 'twitter-api-v2'
import type * as ev from './eventTypes'
import 'dotenv/config'
import { asyncFilter } from '../utils'

const TWITTER_TOKEN_JSON = JSON.parse(process.env.TWITTER_TOKEN_JSON ?? '')
export const FrogRoboID = '2744579940'
export const TrpFrogID = '92482871'

export interface AccountActivityListener {
  /**
   * @param tweet The tweet that was created
   * @param client The Twitter API client
   * @returns Whether to stop processing other listeners
   */
  onTweetCreated?: (tweet: ev.TweetCreateEvent, client: TwitterApi) => Promise<boolean>

  /**
   * @param message The direct message that was sent
   * @param client The Twitter API client
   * @returns Whether to stop processing other listeners
   */
  onDirectMessaged?: (message: ev.DirectMessageEvent, client: TwitterApi) => Promise<boolean>

  /**
   * @param follow
   * @param client
   * @returns Whether to stop processing other listeners
   */
  onFollowed?: (follow: ev.FollowEvent, client: TwitterApi) => Promise<boolean>

  /**
   * @param unfollow
   * @param client
   * @returns Whether to stop processing other listeners
   */
  onUnfollowed?: (unfollow: ev.FollowEvent, client: TwitterApi) => Promise<boolean>

  /**
   * @param favorite
   * @param client
   * @returns Whether to stop processing other listeners
   */
  onFavorited?: (favorite: ev.FavoriteEvent, client: TwitterApi) => Promise<boolean>
}

export class Bot {
  private readonly client: TwitterApi
  private readonly listeners: Array<Required<AccountActivityListener>>
  public readonly userId: string

  /**
   * Create a new bot.
   */
  constructor () {
    this.client = new TwitterApi(TWITTER_TOKEN_JSON.bearer_token)
    this.listeners = []
    this.userId = '2744579940'
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

  /**
   * Run the bot with the given event payload.
   * If a listener returns true, the bot will stop running for the event.
   * @param eventPayload The event payload.
   */
  public async run (eventPayload: ev.EventPayload): Promise<void> {
    for (const listener of this.listeners) {
      if (eventPayload.tweet_create_events != null) {
        eventPayload.tweet_create_events = await asyncFilter(
          eventPayload.tweet_create_events.filter(e => e.user.id_str !== this.userId),
          async e => (
            !await listener.onTweetCreated(e, this.client)
          )
        )
      }
      if (eventPayload.favorite_events != null) {
        eventPayload.favorite_events = await asyncFilter(
          eventPayload.favorite_events.filter(e => e.user.id_str !== this.userId),
          async e => (
            !await listener.onFavorited(e, this.client)
          )
        )
      }
      if (eventPayload.follow_events != null) {
        eventPayload.follow_events = await asyncFilter(
          eventPayload.follow_events, async e => {
            if (e.type === 'follow') {
              return !await listener.onFollowed(e, this.client)
            } else {
              return !await listener.onUnfollowed(e, this.client)
            }
          }
        )
      }
      if (eventPayload.direct_message_events != null) {
        eventPayload.direct_message_events = await asyncFilter(
          eventPayload.direct_message_events.filter(e => e.message_create.sender_id !== this.userId),
          async e => (
            !await listener.onDirectMessaged(e, this.client)
          )
        )
      }
    }
  }
}
