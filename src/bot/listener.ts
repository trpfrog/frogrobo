import type * as ev from './eventTypes'
import { type TwitterApi } from 'twitter-api-v2'
import { type SocialAdapter } from './socialAdapter'

export interface AccountActivityListener {
  /**
   * @param tweet The tweet that was created
   * @param client The Twitter API client
   * @returns Whether to stop processing other listeners
   */
  onTweetCreated?: (tweet: ev.TweetCreateEvent, social: SocialAdapter<TwitterApi>) => Promise<boolean>

  /**
   * @param message The direct message that was sent
   * @param client The Twitter API client
   * @returns Whether to stop processing other listeners
   */
  onDirectMessaged?: (message: ev.DirectMessageEvent, social: SocialAdapter<TwitterApi>) => Promise<boolean>

  /**
   * @param follow
   * @param client
   * @returns Whether to stop processing other listeners
   */
  onFollowed?: (follow: ev.FollowEvent, social: SocialAdapter<TwitterApi>) => Promise<boolean>

  /**
   * @param unfollow
   * @param client
   * @returns Whether to stop processing other listeners
   */
  onUnfollowed?: (unfollow: ev.FollowEvent, social: SocialAdapter<TwitterApi>) => Promise<boolean>

  /**
   * @param favorite
   * @param client
   * @returns Whether to stop processing other listeners
   */
  onFavorited?: (favorite: ev.FavoriteEvent, social: SocialAdapter<TwitterApi>) => Promise<boolean>
}
