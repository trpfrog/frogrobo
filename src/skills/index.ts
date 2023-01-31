import { type AccountActivityListener } from '../bot'
import gptReply from './gptReply'
import autoFollow from './autoFollow'

const actions: AccountActivityListener[] = [
  autoFollow,
  gptReply
]

export default actions
