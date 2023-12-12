import { TranslateAdapter } from '/srv/translate/types'
import needle from 'needle'

const handleTranslate: TranslateAdapter = async (
  { text, from, to },
  log,
  guestId?: string
): Promise<string> => {
  const { generateRequestUrl, normaliseResponse } = require('google-translate-api-browser')

  const fromTo: { from?: string; to: string } = { to: to }

  if (from != null) {
    fromTo['from'] = from
  }

  console.log(`Input text: ${text}`)

  const url = generateRequestUrl(text, fromTo)

  const result = await needle('get', url)

  if (result.statusCode !== 200) {
    throw new Error(
      result.body.message ||
        result.body.details?.message ||
        `Error ${result.statusCode}: ${JSON.stringify(result.body)}`
    )
  }

  const response = normaliseResponse(JSON.parse(result.body))

  console.log(response)

  return response
}

export const googleTranslateHandler = {
  translate: handleTranslate,
}
