import { handle } from '/srv/api/wrap'
import { store } from '/srv/db'
import { translateText } from '/srv/translate'
import { assertValid } from '/common/valid'

export const translate = handle(async ({ body, userId, socketId, log, params }) => {
  assertValid(
    {
      user: 'any?',
      text: 'string',
      messageId: 'string?',
      to: 'string',
      from: 'string?',
      service: 'any',
    },
    body
  )

  const user = userId ? await store.users.getUser(userId) : body.user

  const guestId = userId ? undefined : socketId

  await translateText(
    {
      service: body.service,
      to: body.to,
      from: body.from,
      user: user,
      text: body.text,
      chatId: params.chatId,
      messageId: body.messageId,
    },
    log,
    guestId
  )
})
