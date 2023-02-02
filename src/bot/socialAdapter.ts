import { type TwitterApi } from 'twitter-api-v2'
import { FrogRoboID } from './index'

export interface SocialAdapter<T> {
  rawClient: T
  post: (message: string) => Promise<void>
  reply: (postId: string, message: string) => Promise<void>
  giveReaction: (postId: string, emoji?: string) => Promise<void>
  removeReaction: (postId: string, emoji?: string) => Promise<void>
  follow: (id: string) => Promise<void>
  unfollow: (id: string) => Promise<void>
  sendDM: (userId: string, message: string) => Promise<void>
}

export const createTwitterAdapter = (client: TwitterApi): SocialAdapter<TwitterApi> => ({
  rawClient: client,
  post: async (message: string) => {
    await client.v2.tweet(message)
  },
  reply: async (postId: string, message: string) => {
    await client.v2.reply(message, postId)
  },
  giveReaction: async (postId: string) => {
    await client.v2.like(FrogRoboID, postId)
  },
  removeReaction: async (postId: string) => {
    await client.v2.unlike(FrogRoboID, postId)
  },
  follow: async (userId: string) => {
    await client.v2.follow(FrogRoboID, userId)
  },
  unfollow: async (userId: string) => {
    await client.v2.unfollow(FrogRoboID, userId)
  },
  async sendDM (userId: string, message: string): Promise<void> {
    await client.v2.sendDmInConversation(userId, { text: message })
  }
})
