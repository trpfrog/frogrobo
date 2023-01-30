import { type TweetV1, type UserV1 } from 'twitter-api-v2'

export type AccountActivityAPIEvents =
  | TweetCreateEvent
  | FavoriteEvent
  | FollowEvent
  | BlockEvent
  | MuteEvent
  | UserEvent
  | DirectMessageEvent
  | TweetDeleteEvent

export interface EventPayload {
  for_user_id: string
  tweet_create_events?: TweetCreateEvent[]
  favorite_events?: FavoriteEvent[]
  follow_events?: FollowEvent[]
  block_events?: BlockEvent[]
  mute_events?: MuteEvent[]
  user_event?: UserEvent
  direct_message_events?: DirectMessageEvent[]
  tweet_delete_events?: TweetDeleteEvent[]
}

export type TweetCreateEvent = TweetV1

export interface FavoriteEvent {
  id: string
  created_at: string
  timestamp_ms: number
  favorited_status: TweetV1
  user: UserV1
}

export interface FollowEvent {
  type: 'follow' | 'unfollow'
  created_timestamp: string
  target: UserV1
  source: UserV1
}

export interface BlockEvent {
  type: 'block' | 'unblock'
  created_timestamp: string
  target: UserV1
  source: UserV1
}

export interface MuteEvent {
  type: 'mute' | 'unmute'
  created_timestamp: string
  target: UserV1
  source: UserV1
}

export interface UserEvent {
  revoke: {
    date_time: string
    target: {
      app_id: string
    }
    source: {
      user_id: string
    }
  }
}

export interface DirectMessageEvent {
  type: 'message_create'
  id: string
  created_timestamp: string
  message_create: {
    target: {
      recipient_id: string
    }
    sender_id: string
    source_app_id: string
    message_data: {
      text: string
      entities: {
        hashtags: any[]
        symbols: any[]
        user_mentions: any[]
        urls: any[]
      }
    }
  }
}

export interface TweetDeleteEvent {
  status: {
    id: string
    user_id: string
  }
  timestamp_ms: string
}
