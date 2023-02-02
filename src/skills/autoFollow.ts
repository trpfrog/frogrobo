import { type AccountActivityListener } from '../bot'
import { TrpFrogID } from '../bot'

const autoFollow: AccountActivityListener = {

  // Auto follow if the user is followed by TrpFrog
  onFollowed: async (event, social) => {
    const isFollowed = await social.rawClient.v1.friendship({
      source_id: TrpFrogID,
      target_id: event.source.id_str
    })
    if (isFollowed.relationship.source.following) {
      // follow the user
      await social.follow(event.source.id_str)
      return true
    }
    return false
  },

  // Auto unfollow
  onUnfollowed: async (event, social) => {
    await social.unfollow(event.source.id_str)
    return true
  },

  onDirectMessaged: async (event, social) => {
    const text = event.message_create.message_data.text
    const target = event.message_create.sender_id

    if (text.trim() === 'フォローして') {
      await social.follow(target)
      return true
    } else if (text.trim() === 'リムーブして') {
      await social.unfollow(target)
      return true
    }
    return false
  }
}

export default autoFollow
