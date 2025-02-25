<!-- Copyright (C) 2012-2024 Zammad Foundation, https://zammad-foundation.org/ -->

<script setup lang="ts">
import { useActiveElement } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

import CollapseButton from '#desktop/components/CollapseButton/CollapseButton.vue'
import { useCollapseHandler } from '#desktop/components/CollapseButton/composables/useCollapseHandler.ts'
import CommonButton from '#desktop/components/CommonButton/CommonButton.vue'
import { useResizeLine } from '#desktop/components/ResizeLine/composables/useResizeLine.ts'
import ResizeLine from '#desktop/components/ResizeLine/ResizeLine.vue'

import { SidebarPosition } from './types.ts'

interface Props {
  name: string
  /**
   @property currentWidth
   @property minWidth
   @property maxWidth
   - used for accessibility
   / */
  currentWidth?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  noScroll?: boolean
  collapsible?: boolean
  iconCollapsed?: string
  position?: SidebarPosition
  resizable?: boolean
  id: string
  noPadding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: SidebarPosition.Start,
  hideButtonWhenCollapsed: false,
})

const emit = defineEmits<{
  'resize-horizontal': [number]
  'resize-horizontal-start': []
  'resize-horizontal-end': []
  'reset-width': []
  collapse: [boolean]
  expand: [boolean]
}>()

const { toggleCollapse, isCollapsed } = useCollapseHandler(emit, {
  storageKey: `${props.name}-sidebar-collapsed`,
})

// a11y keyboard navigation
const resizeLineComponent = ref<InstanceType<typeof ResizeLine>>()

const activeElement = useActiveElement()

const handleKeyStroke = (e: KeyboardEvent, adjustment: number) => {
  if (
    !props.currentWidth ||
    activeElement.value !== resizeLineComponent.value?.resizeLine
  )
    return

  e.preventDefault()

  const newWidth = Number(props.currentWidth) + adjustment

  emit('resize-horizontal', newWidth)
}

const { startResizing, isResizingHorizontal } = useResizeLine(
  (positionX) => emit('resize-horizontal', positionX),
  resizeLineComponent.value?.resizeLine,
  handleKeyStroke,
  {
    calculateFromRight: props.position === SidebarPosition.End,
  },
)

watch(isResizingHorizontal, (isResizing) => {
  if (isResizing) {
    emit('resize-horizontal-start')
  } else {
    emit('resize-horizontal-end')
  }
})

const collapseButtonClass = computed(() => {
  if (props.position === SidebarPosition.Start)
    return 'ltr:rounded-l-none rtl:rounded-r-none'
  if (props.position === SidebarPosition.End)
    return 'ltr:rounded-r-none rtl:rounded-l-none'

  return ''
})
</script>

<template>
  <aside
    :id="props.id"
    class="-:bg-neutral-950 -:max-h-screen relative flex flex-col border-neutral-100 dark:border-gray-900"
    :class="{
      'py-3': isCollapsed && !noPadding,
      'border-e': position === SidebarPosition.Start,
      'border-s': position === SidebarPosition.End,
    }"
  >
    <CommonButton
      v-if="iconCollapsed && isCollapsed"
      class="mx-auto"
      size="medium"
      data-test-id="action-button"
      variant="neutral"
      :icon="iconCollapsed"
      @click="toggleCollapse"
    />
    <div
      v-else
      class="flex h-full max-w-full flex-col overflow-x-hidden"
      :class="{
        'p-3': !isCollapsed && !noPadding,
        'overflow-y-hidden': noScroll,
        'overflow-y-auto': !noScroll,
      }"
    >
      <slot v-bind="{ isCollapsed, toggleCollapse }" />
    </div>

    <ResizeLine
      v-if="resizable"
      ref="resizeLineComponent"
      :label="$t('Resize sidebar')"
      class="resize-line absolute z-20 has-[+div:hover]:opacity-100"
      :class="{
        'ltr:right-0 ltr:translate-x-1/2 rtl:left-0 rtl:-translate-x-1/2':
          position === SidebarPosition.Start,
        'ltr:left-0 ltr:-translate-x-1/2 rtl:right-0 rtl:translate-x-1/2':
          position === SidebarPosition.End,
        peer: !resizeLineComponent?.resizing,
      }"
      :values="{
        max: Number(maxWidth)?.toFixed(2),
        min: minWidth,
        current: currentWidth,
      }"
      :disabled="isCollapsed"
      @mousedown-event="startResizing"
      @touchstart-event="startResizing"
      @dblclick-event="$emit('reset-width')"
    />

    <CollapseButton
      v-if="collapsible"
      :collapsed="isCollapsed"
      :owner-id="id"
      class="absolute top-[49px] z-30 peer-hover:opacity-100"
      :inverse="position === SidebarPosition.End"
      variant="tertiary-gray"
      :collapse-label="$t('Collapse sidebar')"
      :expand-label="$t('Expand sidebar')"
      :class="{
        'ltr:right-0 ltr:translate-x-[calc(100%-10px)] rtl:left-0 rtl:-translate-x-[calc(100%-10px)]':
          position === SidebarPosition.Start,
        'ltr:left-0 ltr:-translate-x-[calc(100%-10px)] rtl:right-0 rtl:translate-x-[calc(100%-10px)]':
          position === SidebarPosition.End,
        'ltr:translate-x-[calc(100%-7.5px)] rtl:-translate-x-[calc(100%-7.5px)]':
          isCollapsed && position === SidebarPosition.Start,
        'ltr:-translate-x-[calc(100%-7.5px)] rtl:translate-x-[calc(100%-7.5px)]':
          isCollapsed && position === SidebarPosition.End,
      }"
      :button-class="collapseButtonClass"
      @click="(node: MouseEvent) => (node.target as HTMLButtonElement)?.blur()"
      @toggle-collapse="toggleCollapse"
    />
  </aside>
</template>
