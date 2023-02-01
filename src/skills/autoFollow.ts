import { type AccountActivityListener } from '../bot'
import { TrpFrogID, FrogRoboID } from '../bot'

const autoFollow: AccountActivityListener = {

  // Auto follow if the user is followed by TrpFrog
  onFollowed: async (event, client) => {
    const isFollowed = await client.v1.friendship({
      source_id: TrpFrogID,
      target_id: event.source.id_str
    })
    if (isFollowed.relationship.source.following) {
      // follow the user
      await client.v2.follow(FrogRoboID, event.source.id_str)
      return true
    }
    return false
  },

  // Auto unfollow
  onUnfollowed: async (event, client) => {
    await client.v2.unfollow(FrogRoboID, event.source.id_str)
    return true
  },

  onDirectMessaged: async (event, client) => {
    const text = event.message_create.message_data.text
    const target = event.message_create.sender_id
    const conversationId = event.message_create.target.recipient_id

    if (text.trim() === 'フォローして') {
      await client.v2.follow(FrogRoboID, target)
      await client.v2.sendDmInConversation(conversationId, { text: 'フォローしました。' })
      return true
    } else if (text.trim() === 'リムーブして') {
      await client.v2.unfollow(FrogRoboID, target)
      await client.v2.sendDmInConversation(conversationId, { text: 'リムーブしました。' })
      return true
    }
    return false
  }
}

export default autoFollow
