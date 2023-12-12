import { api, isLoggedIn } from '/web/store/api'
import { getStore } from '/web/store/create'
import { loadItem } from '/web/store/data/storage'
import { TranslateService } from '/common/types/translate-schema'

type GenerateOpts = {
  chatId?: string
  messageId?: string
  text: string
  translateService: TranslateService
  to: string
  from?: string
}

export const translateApi = {
  translate,
}

async function translate({ chatId, messageId, text, translateService, to, from }: GenerateOpts) {
  const user = getUserEntity()
  const res = await api.post<{ success: boolean }>(`/chat/${chatId}/translate`, {
    user,
    messageId,
    text,
    translateService,
    to,
    from,
  })
  return res
}

function getUserEntity() {
  if (isLoggedIn()) {
    const { user } = getStore('user').getState()
    return user
  }
  const user = loadItem('config')
  return user
}
