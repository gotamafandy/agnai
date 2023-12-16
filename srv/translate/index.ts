import { TranslateHandler, TranslateRequest, TranslateResponse } from '/srv/translate/types'
import { TranslationService } from '/common/types/translation-schema'
import { googleTranslateHandler } from '/srv/translate/google-translate'
import { AppLog } from '/srv/logger'

export async function translateText({ chatId, ...opts }: TranslateRequest, log: AppLog) {
  const service = getTranslateService(opts.service)

  if (!service) return { output: undefined }

  let translated: TranslateResponse | undefined
  //let error: any

  const text = opts.text
  const from = opts.from
  const to = opts.to
  try {
    translated = await service.translate({ text, from, to })
  } catch (ex: any) {
    log.error({ err: ex }, 'Failed to translate text')
  }

  return { data: translated }
}

export function getTranslateService(
  translateService?: TranslationService
): TranslateHandler | undefined {
  switch (translateService) {
    case 'googletranslate':
      return googleTranslateHandler
    default:
      return
  }
}
