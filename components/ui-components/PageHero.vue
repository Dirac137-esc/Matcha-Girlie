<script setup lang="ts">
import { computed } from 'vue'

type Crumb = { label: string; to?: string }

const props = defineProps<{
  title: string
  breadcrumbs?: Crumb[]
  imageSrc?: string
  /** space reserved on the right for the art (px) */
  artWidth?: number
  color?: string
  rounded?: string | number
  padding?: string
}>()

const bgColor  = computed(() => props.color ?? 'lightprimary')
const rounded  = computed(() => props.rounded ?? 'xl')
const padClass = computed(() => props.padding ?? 'px-6 py-6')
const rightPad = computed(() => (props.imageSrc ? (props.artWidth ?? 220) : 0))
</script>

<template>
  <v-sheet
      :color="bgColor"
      :rounded="rounded"
      class="page-hero mb-4"
      role="banner"
  >
    <!-- CONTENT -->
    <div
        class="hero-inner d-flex flex-column justify-center"
        :class="padClass"
        :style="{ paddingRight: rightPad + 'px' }"
    >
      <div class="text-body-2 text-medium-emphasis mb-1" aria-label="breadcrumbs">
        <template v-if="breadcrumbs?.length">
          <template v-for="(c, i) in breadcrumbs" :key="i">
            <NuxtLink v-if="c.to" :to="c.to" class="text-medium-emphasis text-decoration-none">
              {{ c.label }}
            </NuxtLink>
            <span v-else class="text-medium-emphasis">{{ c.label }}</span>
            <span v-if="i !== breadcrumbs.length - 1" class="mx-2" aria-hidden="true">•</span>
          </template>
        </template>
        <template v-else>
          Home <span class="mx-2">•</span> {{ title }}
        </template>
      </div>

      <h1 class="text-h4 text-high-emphasis mb-0">{{ title }}</h1>
    </div>

    <!-- ART (anchored to bottom) -->
    <div class="hero-art d-none d-sm-block">
      <slot name="right">
        <img v-if="imageSrc" :src="imageSrc" alt="" class="hero-img" />
      </slot>
    </div>
  </v-sheet>
</template>

<style scoped>
.page-hero {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
}

/* Leaves room for the illustration on the right via inline style (padding-right) */
.hero-inner {
  min-height: 132px;
}

/* Absolute, touches the bottom edge */
.hero-art {
  position: absolute;
  right: 44px;
  bottom: -10px;            /* ← makes it “in contact with bottom” */
  pointer-events: none; /* avoids covering UI */
}

/* Size the illustration */
.hero-img {
  display: block;
  height: 140px;
  width: auto;
  object-fit: contain;
}

@media (min-width: 1280px) {
  .hero-img { height: 100px; }
}
@media (max-width: 600px) {
  .hero-art { display: none; }
}
</style>
