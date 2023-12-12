import { userStore } from '../../../store'
import { Component, Show, createMemo, createSignal } from 'solid-js'
import { Toggle } from '../../../shared/Toggle'
import Tabs from '../../../shared/Tabs'
import Divider from '../../../shared/Divider'
import { getSpeechRecognition } from '../../Chat/components/SpeechRecognitionRecorder'
import { UI } from '/common/types'

const translateServiceTabs = {
  googletranslate: 'Google Translate',
}

type Tab = keyof typeof translateServiceTabs

export const VoiceSettings: Component = () => {
  const state = userStore()

  const [currentType, setType] = createSignal(state.user?.translation?.type || 'googletranslate')

  const [tab, setTab] = createSignal(0)
  const tabs: Tab[] = ['googletranslate']
  const currentTab = createMemo(() => tabs[tab()])
  const subclass = 'flex flex-col gap-4'

  return (
    <>
      <div class="flex flex-col gap-4">
        <p class="text-lg font-bold">Chat translation</p>

        <p class="text-lg font-bold">Text to Speech (Character Voice)</p>

        <p class="italic">You need to configure a voice on the character's edit page.</p>

        <Toggle
          label="Enabled"
          helperText="Characters with a configured voice will speak automatically."
          fieldName="textToSpeechEnabled"
          value={state.user?.texttospeech?.enabled ?? true}
        />

        <Toggle
          label="Filter Action Text"
          helperText="Skips text in asterisks and parenthesis."
          fieldName="textToSpeechFilterActions"
          value={state.user?.texttospeech?.filterActions ?? true}
        />

        <Divider />

        <p class="text-lg font-bold">Voice Services</p>

        <div class="my-2">
          <Tabs tabs={tabs.map((t) => ttsServiceTabs[t])} selected={tab} select={setTab} />
        </div>

        <div class="flex flex-col gap-4">
          <div class={currentTab() === 'webspeechsynthesis' ? subclass : 'hidden'}>
            <WebSpeechSynthesisSettings />
          </div>

          <div class={currentTab() === 'elevenlabs' ? subclass : 'hidden'}>
            <ElevenLabsSettings />
          </div>

          <div class={currentTab() === 'novel' ? subclass : 'hidden'}>
            <NovelTtsSettings />
          </div>
        </div>
      </div>
    </>
  )
}
