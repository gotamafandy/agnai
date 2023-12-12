import { TranslateService } from '/common/types/translate-schema'
import { AppSchema } from '/common/types'
import { AppLog } from '/srv/logger'

export type TranslateRequest = {
  text: string
  from?: string
  to: string
  service: TranslateService
  user: AppSchema.User
  chatId: string
  messageId?: string
}

export type TranslateAdapter = (
  opts: {
    user: AppSchema.User
    text: string
    from?: string
    to: string
  },
  log: AppLog,
  guestId?: string
) => Promise<string>

export type TranslateHandler = {
  translate: TranslateAdapter
}
