import { Component, For, Match, Show, Switch, createSignal, createMemo } from 'solid-js'
import { CardProps, ViewProps } from './types'
import Divider from '/web/shared/Divider'
import { A, useNavigate } from '@solidjs/router'
import AvatarContainer from '/web/shared/Avatar/Container'
import { getAssetUrl } from '/web/shared/util'
import { Copy, Download, Edit, Menu, MessageCircle, Star, Trash, VenetianMask } from 'lucide-solid'
import { DropMenu } from '/web/shared/DropMenu'
import Button from '/web/shared/Button'
import { useTransContext } from '@mbarzda/solid-i18next'
import { userStore } from '../../../store'

export const CharacterCardView: Component<ViewProps> = (props) => {
  return (
    <For each={props.groups}>
      {(group, i) => (
        <>
          <Show when={props.showGrouping}>
            <h2 class="text-xl font-bold">{group.label}</h2>
          </Show>
          <div class="grid w-full grid-cols-[repeat(auto-fit,minmax(160px,1fr))] flex-row flex-wrap justify-start gap-2 py-2">
            <For each={group.list}>
              {(char) => (
                <Character
                  edit={() => props.setEdit(char)}
                  char={char}
                  delete={() => props.setDelete(char)}
                  download={() => props.setDownload(char)}
                  toggleFavorite={(value) => props.toggleFavorite(char._id, value)}
                />
              )}
            </For>
            <Show when={group.list.length < 6}>
              <For each={new Array(6 - group.list.length)}>{() => <div></div>}</For>
            </Show>
          </div>
          <Show when={i() < props.groups.length - 1}>
            <Divider />
          </Show>
        </>
      )}
    </For>
  )
}

const Character: Component<CardProps> = (props) => {
  const [t] = useTransContext()

  const [opts, setOpts] = createSignal(false)
  const nav = useNavigate()
  const user = userStore()

  let ref: any
  
  const isEditable = createMemo(() => props.char.userId === user.user?._id)

  return (
    <div
      ref={ref}
      class="bg-800 relative flex flex-col items-center justify-between gap-1 rounded-lg border-[1px] border-[var(--bg-600)]"
    >
      <div class="w-full">
        <Switch>
          <Match when={props.char.visualType === 'sprite' && props.char.sprite}>
            <A
              href={`/character/${props.char._id}/chats`}
              class="block h-60 w-full justify-center overflow-hidden rounded-lg"
            >
              <AvatarContainer container={ref} body={props.char.sprite} />
            </A>
          </Match>
          <Match when={props.char.avatar}>
            <A
              href={`/character/${props.char._id}/chats`}
              class="block h-60 w-full justify-center overflow-hidden rounded-lg rounded-b-none"
            >
              <img
                src={getAssetUrl(props.char.avatar!)}
                class="h-full w-full object-cover"
                style="object-position: 50% 30%;"
              />
            </A>
          </Match>
          <Match when>
            <A
              href={`/character/${props.char._id}/chats`}
              class="bg-700 flex h-32 w-full items-center justify-center rounded-lg rounded-b-none"
            >
              <VenetianMask size={24} />
            </A>
          </Match>
        </Switch>
      </div>
      <div class="w-full text-sm">
        <div class="overflow-hidden text-ellipsis whitespace-nowrap px-1 text-center font-bold">
          {props.char.name}
        </div>
        <div class="text-600 mt-2 mb-2 line-clamp-3 h-[3rem] text-ellipsis px-1 text-center text-xs font-normal">
          {props.char.description}
        </div>
        <Button class="w-full mt-3" onClick={() => nav(`/chats/create/${props.char._id}`)}>
          <MessageCircle /> Chat
        </Button>
        <div
          class="absolute top-0 right-0 mr-1 mt-1"
          onClick={() => setOpts(true)}
        >
          <div class="rounded-md border-[1px] border-[var(--bg-400)] bg-[var(--bg-700)] p-[2px]">
            <Menu size={24} class="icon-button" color="var(--bg-100)" />
          </div>
          <DropMenu
            show={opts()}
            close={() => setOpts(false)}
            customPosition="right-[9px] top-[6px]"
          >
            <div class="flex flex-col gap-2 p-2">
              <Button onClick={() => nav(`/chats/create/${props.char._id}`)} alignLeft size="sm">
                <MessageCircle /> {t('chat')}
              </Button>
              <Show when={isEditable()}>
                <Button
                  alignLeft
                  size="sm"
                  onClick={() => {
                    setOpts(false)
                    props.download()
                  }}
                >
                  <Download /> Download
                </Button>
                <Button alignLeft onClick={props.edit} size="sm">
                  <Edit /> Edit
                </Button>
                <Button
                  alignLeft
                  onClick={() => nav(`/character/create/${props.char._id}`)}
                  size="sm"
                >
                  <Copy /> Duplicate
                </Button>
                <Button
                  alignLeft
                  size="sm"
                  schema="red"
                  onClick={() => {
                    setOpts(false)
                    props.delete()
                  }}
                >
                  <Trash /> Delete
                </Button>
              </Show>
            </div>
          </DropMenu>
        </div>
      </div>
    </div>
  )
}
