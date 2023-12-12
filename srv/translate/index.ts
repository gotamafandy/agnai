import { TranslateHandler, TranslateRequest } from '/srv/translate/types'
import { TranslateService } from '/common/types/translate-schema'
import { googleTranslateHandler } from '/srv/translate/google-translate'
import { AppLog } from '/srv/logger'

export async function translateText(
  { user, chatId, messageId, ...opts }: TranslateRequest,
  log: AppLog,
  guestId?: string
) {
  const service = getTranslateService(opts.service)

  if (!service) return { output: undefined }

  let translated: string | undefined
  //let error: any

  const text = opts.text
  const from = opts.from
  const to = opts.to
  try {
    translated = await service.translate({ user, text, from, to }, log, guestId)

    console.log(translated)
  } catch (ex: any) {
    //error = ex.message || ex
    log.error({ err: ex }, 'Failed to translate text')
  }
}

export function getTranslateService(
  translateService?: TranslateService
): TranslateHandler | undefined {
  switch (translateService) {
    case 'googletranslate':
      return googleTranslateHandler
    default:
      return
  }
}
