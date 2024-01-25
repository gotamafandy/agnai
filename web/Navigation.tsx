import { A, useLocation } from '@solidjs/router'
import {
  Activity,
  Bell,
  Book,
  ChevronRight,
  HeartHandshake,
  HelpCircle,
  LogIn,
  MessageCircle,
  Moon,
  Plus,
  Settings,
  ShoppingBag,
  Sliders,
  Speaker,
  Sun,
  VenetianMask,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-solid'
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  Match,
  onMount,
  Show,
  Switch,
} from 'solid-js'
import AvatarIcon, { CharacterAvatar } from './shared/AvatarIcon'
import {
  audioStore,
  characterStore,
  chatStore,
  inviteStore,
  settingStore,
  toastStore,
  userStore,
} from './store'
import Slot from './shared/Slot'
import { useEffect, useResizeObserver, useWindowSize } from './shared/hooks'
import WizardIcon from './icons/WizardIcon'
import Badge from './shared/Badge'
import { soundEmitter } from './shared/Audio/playable-events'
import { useTransContext } from '@mbarzda/solid-i18next'

const MobileNavHeader: Component = () => {
  const user = userStore()
  const suffix = createMemo(() => (user.sub?.level ?? -1 > 0 ? '+' : ''))

  return (
    <div class="flex min-h-[2rem] justify-between sm:hidden">
      <div class="w-8"></div>
      <div>
        <span class="w-full text-center text-[1rem]">
          Agn<span class="text-[var(--hl-500)]">ai</span>
          {suffix()}
        </span>
      </div>
      <div class="w-8">
        <div class="icon-button">
          <X onClick={settingStore.menu} />
        </div>
      </div>
    </div>
  )
}

const Navigation: Component = () => {
  const [t] = useTransContext()

  let parent: any
  let content: any
  const state = settingStore()
  const user = userStore()
  const chat = chatStore()
  const size = useWindowSize()

  const suffix = createMemo(() => (user.sub?.level ?? -1 > 0 ? '+' : ''))

  createEffect(() => {
    if (!state.overlay && state.showMenu) {
      settingStore.menu()
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (!parent || !content) return

      parent.setAttribute('style', '')
      content.setAttribute('style', '')
    }, 50)

    return () => clearInterval(interval)
  })

  const hide = createMemo(() => {
    if (!!chat.opts.pane && !state.showMenu) return 'drawer--hide'
    if (state.showMenu) return ''
    return 'drawer--hide'
  })

  const fullscreen = createMemo(() => {
    if (state.fullscreen) return 'hidden'

    if (chat.opts.pane && size.width() <= 1200) {
      return 'hidden'
    }

    return ''
  })

  return (
    <>
      <div
        ref={parent}
        class={`drawer bg-800 flex flex-col gap-2 px-2 pt-2 ${hide()} ${fullscreen()}`}
        role="navigation"
        aria-label="Main"
      >
        <div ref={content} class="drawer__content sm:text-md text-md flex flex-col gap-0  sm:gap-1">
          <div class="hidden w-full items-center justify-center sm:flex">
            <A href="/" role="link" aria-label="Agnaistic main page">
              <div
                class="h-8 w-fit items-center justify-center rounded-lg font-bold"
                aria-hidden="true"
              >
                Agn<span class="text-[var(--hl-500)]">ai</span>
                {suffix()}
              </div>
            </A>
          </div>

          <MobileNavHeader />

          <Show when={user.loggedIn} fallback={<GuestNavigation />}>
            <UserNavigation />
          </Show>
        </div>

        <div
          class="absolute bottom-0 flex w-full flex-col items-center justify-between px-4"
          classList={{
            'h-8': state.config.policies,
            'h-4': !state.config.policies,
          }}
        >
          <Show when={state.config.policies}>
            <div class="text-500 flex w-full justify-center gap-4 text-xs">
              <div>
                <A href="/terms-of-service">{t('term_of_service')}</A>
              </div>
              <div>
                <A href="/privacy-policy">{t('privacy_policy')}</A>
              </div>
            </div>
          </Show>
          <div class="text-500 mb-1 text-[0.6rem] italic" role="contentinfo" aria-label="Version">
            {state.config.version}
          </div>
        </div>
      </div>
    </>
  )
}

const UserNavigation: Component = () => {
  const [t] = useTransContext()

  const user = userStore()
  const menu = settingStore()
  const toasts = toastStore()
  const invites = inviteStore()

  const guidance = createMemo(() => {
    const usable = menu.config.subs.some((sub) => sub.guidance)
    if (!usable) return false

    const access = !!menu.config.guidanceAccess || !!user.user?.admin
    return access
  })

  const count = createMemo(() => {
    return toasts.unseen + invites.invites.length
  })

  return (
    <>
      <UserProfile />

      <Show when={menu.flags.chub}>
        <Item href="/chub" ariaLabel="Character hub">
          <ShoppingBag aria-hidden="true" />
          {t('chub')}
        </Item>
      </Show>

      <CharacterLink />

      <ChatLink />

      <Show when={guidance()}>
        <Item href="/mode/preview/" ariaLabel="Sagas Preview">
          <Wand2 aria-hidden="true" />
          {t('sagas_preview')}
        </Item>
      </Show>

      <Show when={user.user?.admin}>
        <Library />
        <MultiItem>
          <Item href="/presets" ariaLabel="Presets">
            <Sliders aria-hidden="true" />
            <span aria-hidden="true">{t('presets')}</span>
          </Item>
          <EndItem>
            <A class="icon-button" href="/presets/new" role="button" aria-label="Add a new preset">
              <Plus aria-hidden="true" />
            </A>
          </EndItem>
        </MultiItem>
      </Show>

      <Show when={menu.flags.sounds}>
        <Sounds />
      </Show>

      <Show when={user.user?.admin}>
        <Item href="/admin/metrics" ariaLabel="Manage">
          <Activity aria-hidden="true" />
          <span aria-hidden="true">{t('manage')}</span>
        </Item>
        <SubMenu>
          <SubItem href="/admin/configuration" parent="/admin/" ariaLabel={t('configuration')}>
            {t('configuration')}
          </SubItem>
          <SubItem href="/admin/users" parent="/admin/" ariaLabel={t('users')}>
            {t('users')}
          </SubItem>
          <SubItem href="/admin/subscriptions" parent="/admin/" ariaLabel={t('subscriptions')}>
            {t('subscriptions')}
          </SubItem>
          <SubItem href="/admin/announcements" parent="/admin/" ariaLabel={t('announcements')}>
            {t('announcements')}
          </SubItem>
        </SubMenu>
      </Show>

      <div class="flex flex-wrap justify-center gap-[2px] text-sm">
        <Show when={user.user?.admin}>
          <Item href="/faq" ariaLabel={t('open_faq_page')}>
            <HelpCircle aria-hidden="true" />
          </Item>
        </Show>
        <Show when={menu.config.patreon}>
          <ExternalLink href="https://patreon.com/Agnaistic" newtab ariaLabel="Patreon">
            <HeartHandshake aria-hidden="true" />
          </ExternalLink>
        </Show>
        <Show when={user.user?.admin}>
          <Item href="/settings" ariaLabel="Open settings page">
            <Settings aria-hidden="true" />
          </Item>
        </Show>
        <Item
          ariaLabel={t('toggle_between_light_and_dark_mode')}
          onClick={() => {
            userStore.saveUI({ mode: user.ui.mode === 'light' ? 'dark' : 'light' })
          }}
        >
          <Show when={user.ui.mode === 'dark'} fallback={<Sun />}>
            <Moon aria-hidden="true" />
          </Show>
        </Item>

        <Item
          onClick={() => {
            if (menu.showMenu) settingStore.closeMenu()
            toastStore.modal(true)
          }}
          ariaLabel={t('show_notification_list')}
        >
          <Switch>
            <Match when={count() > 0}>
              <div
                class="relative flex"
                role="status"
                aria-label={t('status_you_have_x_new_notifications', { count: count() })}
              >
                <Bell fill="var(--bg-100)" aria-hidden="true" />
                <span class="absolute bottom-[-0.5rem] right-[-0.5rem]" aria-hidden="true">
                  <Badge>{count() > 9 ? '9+' : count()}</Badge>
                </span>
              </div>
            </Match>

            <Match when={!count()}>
              <Bell color="var(--bg-500)" role="status" aria-label="Status: No new notifications" />
            </Match>
          </Switch>
        </Item>
      </div>

      <Slots />
    </>
  )
}

const GuestNavigation: Component = () => {
  const [t] = useTransContext()

  const toasts = toastStore()
  const user = userStore()
  const menu = settingStore((s) => ({
    showMenu: s.showMenu,
    config: s.config,
    guest: s.guestAccessAllowed,
    flags: s.flags,
  }))

  return (
    <>
      <Show when={menu.config.canAuth}>
        <Item
          href="/login"
          ariaLabel={t('login_to_the_application')}
          onClick={() => soundEmitter.emit('menu-item-clicked', 'login')}
        >
          <LogIn /> {t('login')}
        </Item>
      </Show>

      <Show when={menu.guest}>
        <UserProfile />

        <CharacterLink />

        <Show when={menu.flags.chub}>
          <Item href="/chub" ariaLabel="Character hub">
            <ShoppingBag aria-hidden="true" />
            {t('chub')}
          </Item>
        </Show>

        <ChatLink />

        <Show when={user.user?.admin}>
          <Library />
        </Show>

        <Show when={user.user?.admin}>
          <MultiItem>
            <Item
              href="/presets"
              ariaLabel={t('presets')}
              onClick={() => soundEmitter.emit('menu-item-clicked', 'presets')}
            >
              <Sliders /> {t('presets')}
            </Item>
            <EndItem>
              <A
                class="icon-button"
                href="/presets/new"
                role="button"
                aria-label={t('add_a_new_preset')}
              >
                <Plus aria-hidden="true" />
              </A>
            </EndItem>
          </MultiItem>
        </Show>

        <Show when={menu.flags.sounds}>
          <Sounds />
        </Show>
      </Show>

      <div class="flex flex-wrap justify-center gap-[2px] text-sm">
        <Item href="/faq" ariaLabel={t('open_faq_page')}>
          <HelpCircle aria-hidden="true" />
        </Item>

        <Show when={menu.config.patreon}>
          <ExternalLink href="https://patreon.com/Agnaistic" newtab ariaLabel={t('patreon')}>
            <HeartHandshake aria-hidden="true" />
          </ExternalLink>
        </Show>
        <Show when={user.user?.admin}>
          <Item href="/settings" ariaLabel={t('open_settings_page')}>
            <Settings aria-hidden="true" />
          </Item>
        </Show>

        <Item
          ariaLabel={t('toggle_between_light_and_dark_mode')}
          onClick={() => {
            userStore.saveUI({ mode: user.ui.mode === 'light' ? 'dark' : 'light' })
          }}
        >
          <Show when={user.ui.mode === 'dark'} fallback={<Sun />}>
            <Moon aria-hidden="true" />
          </Show>
        </Item>

        <Item
          onClick={() => {
            if (menu.showMenu) settingStore.closeMenu()
            toastStore.modal(true)
          }}
          ariaLabel={t('show_notification_list')}
        >
          <Switch>
            <Match when={toasts.unseen > 0}>
              <div
                class="relative flex"
                role="status"
                aria-label={t('status_you_have_x_new_notifications', { count: toasts.unseen })}
              >
                <Bell fill="var(--bg-100)" aria-hidden="true" />
                <span class="absolute bottom-[-0.5rem] right-[-0.5rem]" aria-hidden="true">
                  <Badge>{toasts.unseen > 9 ? '9+' : toasts.unseen}</Badge>
                </span>
              </div>
            </Match>

            <Match when={!toasts.unseen}>
              <Bell
                color="var(--bg-500)"
                role="status"
                aria-label={t('status_no_new_notifications')}
              />
            </Match>
          </Switch>
        </Item>
      </div>

      <Slots />
    </>
  )
}

const Item: Component<{
  href?: string
  ariaLabel?: string
  children: string | JSX.Element
  onClick?: () => void
}> = (props) => {
  const menu = settingStore()
  return (
    <>
      <Show when={!props.href}>
        <div
          class="flex min-h-[2.5rem] cursor-pointer items-center justify-start gap-4 rounded-lg px-2 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
          onClick={() => {
            if (props.onClick) props.onClick()
            else if (menu.showMenu) settingStore.closeMenu()
          }}
          tabindex={0}
          role="button"
          aria-label={props.ariaLabel}
        >
          {props.children}
        </div>
      </Show>
      <Show when={props.href}>
        <A
          href={props.href!}
          class="flex min-h-[2.5rem] items-center justify-start gap-4 rounded-lg px-2 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
          onClick={() => {
            if (props.onClick) props.onClick()
            if (menu.showMenu) settingStore.closeMenu()
          }}
          role="button"
          aria-label={props.ariaLabel}
        >
          {props.children}
        </A>
      </Show>
    </>
  )
}

const SubMenu: Component<{ children: any }> = (props) => <div class="bg-900">{props.children}</div>

const SubItem: Component<{
  parent: string
  href: string
  ariaLabel?: string
  children: string | JSX.Element
  onClick?: () => void
}> = (props) => {
  const menu = settingStore()
  const loc = useLocation()
  return (
    <Show when={loc.pathname.startsWith(props.parent)}>
      <A
        activeClass="bg-[var(--hl-900)]"
        href={props.href!}
        class="flex min-h-[2.5rem] items-center justify-start gap-4 rounded-lg px-2 pl-4 hover:bg-[var(--bg-700)] sm:min-h-[2.5rem]"
        onClick={() => {
          if (menu.showMenu) settingStore.closeMenu()
        }}
        role="button"
        aria-label={props.ariaLabel}
      >
        <ChevronRight aria-hidden="true" size={14} />
        <span aria-hidden="true">{props.children}</span>
      </A>
    </Show>
  )
}

export default Navigation

const ExternalLink: Component<{
  href: string
  newtab?: boolean
  ariaLabel?: string
  children?: any
}> = (props) => (
  <a
    class="flex h-10 items-center justify-start gap-4 rounded-xl px-2 hover:bg-[var(--bg-700)] sm:h-12"
    href={props.href}
    target={props.newtab ? '_blank' : ''}
    role="link"
    aria-label={props.ariaLabel}
  >
    {props.children}
  </a>
)

const Library: Component<{}> = (props) => {
  const [t] = useTransContext()

  return (
    <div class="grid w-full gap-2" style={{ 'grid-template-columns': '1fr 30px' }}>
      <Item
        href="/memory"
        ariaLabel={t('library')}
        onClick={() => soundEmitter.emit('menu-item-clicked', 'library')}
      >
        <Book aria-hidden="true" />
        <span aria-hidden="true">{t('library')}</span>
      </Item>
    </div>
  )
}

const Sounds: Component<{}> = (props) => {
  const [t] = useTransContext()

  const audioSettings = audioStore()

  return (
    <MultiItem>
      <Item href="/sounds" onClick={() => soundEmitter.emit('menu-item-clicked', 'sounds')}>
        <Speaker /> {t('sounds')}
      </Item>
      <EndItem>
        <a class="icon-button" onClick={() => audioStore.toggleMuteTrack('master')}>
          <Show when={audioSettings.tracks.master.muted}>
            <VolumeX />
          </Show>
          <Show when={!audioSettings.tracks.master.muted}>
            <Volume2 />
          </Show>
        </a>
      </EndItem>
    </MultiItem>
  )
}

const CharacterLink: Component = () => {
  const [t] = useTransContext()

  const user = userStore()

  return (
    <MultiItem>
      <Item
        href="/character/list"
        ariaLabel={t('characters')}
        onClick={() => soundEmitter.emit('menu-item-clicked', 'characters')}
      >
        <WizardIcon aria-hidden="true" />
        <span aria-hidden="true">{t('characters')}</span>
      </Item>
      <Show when={user.user?.admin}>
        <EndItem>
          <A class="icon-button" href="/editor" role="button" aria-label={t('add_a_new_character')}>
            <Plus aria-hidden="true" />
          </A>
        </EndItem>
      </Show>
    </MultiItem>
  )
}

const ChatLink: Component = () => {
  const [t] = useTransContext()

  return (
    <MultiItem>
      <Item
        href="/chats"
        ariaLabel={t('chats')}
        onClick={() => soundEmitter.emit('menu-item-clicked', 'chats')}
      >
        <MessageCircle fill="var(--bg-100)" aria-hidden="true" />
        <span aria-hidden="true">{t('chats')}</span>
      </Item>
      <EndItem>
        <A
          class="icon-button"
          href="/chats/create"
          role="button"
          aria-label={t('create_a_new_chat')}
        >
          <Plus aria-hidden="true" />
        </A>
      </EndItem>
    </MultiItem>
  )
}

const UserProfile: Component = () => {
  const [t] = useTransContext()

  const chars = characterStore()
  const user = userStore()
  const menu = settingStore()

  return (
    <>
      <div
        class="grid w-full items-center justify-between gap-2"
        style={{
          'grid-template-columns': '1fr 30px',
        }}
      >
        <Item
          ariaLabel={t('edit_user_profile')}
          onClick={() => {
            if (menu.showMenu) settingStore.closeMenu()
            soundEmitter.emit('menu-item-clicked', 'profile')
            userStore.modal(true)
          }}
        >
          <Switch>
            <Match when={chars.impersonating}>
              <CharacterAvatar
                char={chars.impersonating!}
                format={{ corners: 'circle', size: 'xs' }}
              />
            </Match>

            <Match when>
              <AvatarIcon
                avatarUrl={chars.impersonating?.avatar || user.profile?.avatar}
                format={{ corners: 'circle', size: 'xs' }}
              />
            </Match>
          </Switch>
          <span aria-hidden="true">{chars.impersonating?.name || user.profile?.handle}</span>
        </Item>
        <Show when={user.user?.admin}>
          <div class="flex items-center">
            <a
              href="#"
              role="button"
              aria-label={t('open_impersonation_menu')}
              class="icon-button"
              onClick={() => {
                settingStore.toggleImpersonate(true)
                if (menu.showMenu) settingStore.closeMenu()
              }}
            >
              <VenetianMask aria-hidden="true" />
            </a>
          </div>
        </Show>
      </div>
    </>
  )
}

const MultiItem: Component<{ children: any }> = (props) => {
  return (
    <div class="grid w-full gap-2" style={{ 'grid-template-columns': '1fr 30px' }}>
      {props.children}
    </div>
  )
}

const EndItem: Component<{ children: any }> = (props) => {
  return <div class="flex items-center">{props.children}</div>
}

const Slots: Component = (props) => {
  let ref: HTMLDivElement
  const state = settingStore()
  const { load } = useResizeObserver()

  onMount(() => {
    load(ref)
  })

  const [rendered, setRendered] = createSignal(false)

  createEffect(() => {
    if (rendered()) return

    if (state.showMenu) {
      setTimeout(() => setRendered(true), 500)
    }
  })

  return (
    <div ref={ref!} class="h-full w-full">
      <Slot parent={ref!} slot="menu" />
    </div>
  )
}
