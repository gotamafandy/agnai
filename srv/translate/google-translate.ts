import { TranslateAdapter, TranslateResponse } from '/srv/translate/types'

const handleTranslate: TranslateAdapter = async ({
  text,
  from,
  to,
}): Promise<TranslateResponse> => {
  const { translate } = require('google-translate-api-browser')

  const fromTo: { from?: string; to: string } = { to: to }

  if (from != null) {
    fromTo['from'] = from
  }

  const res = await translate(text, fromTo)

  return {
    text: res.text,
    originalText: text,
    service: 'googletranslate',
  }
}

export const googleTranslateHandler = {
  translate: handleTranslate,
}
