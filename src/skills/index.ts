import { type AccountActivityListener } from '../bot'
import gptReply from './gptReply'
import autoFollow from './autoFollow'

const actions: AccountActivityListener[] = [
  autoFollow,

  // gptReply should be the last one
  gptReply
]

export default actions
