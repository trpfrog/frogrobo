import { type AccountActivityListener } from '../bot'
import gptReply from './gptReply'
import autoFollow from './autoFollow'
import songwhipReply from './songwhip'

const actions: AccountActivityListener[] = [
  autoFollow,
  songwhipReply,

  // gptReply should be the last one
  gptReply
]

export default actions
