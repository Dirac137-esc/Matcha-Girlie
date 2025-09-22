<script setup lang="ts">
import { ref, shallowRef } from "vue";
import sidebarItems from "@/components/layout/full/vertical-sidebar/sidebarItem";
import { Menu2Icon } from "vue-tabler-icons";
import {PerfectScrollbar} from "vue3-perfect-scrollbar";
const sidebarMenu = shallowRef(sidebarItems);
const sDrawer = ref(true);
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'
const { toggle, label } = useThemeSwitcher()
const cartCount = ref(2)
const hasNewNotifs = ref(true)





const themeIcon = computed(() =>

    String(label?.value ?? '').toLowerCase().includes('dark')
        ? 'mdi-moon-waxing-crescent'
        : 'mdi-weather-sunny'
)
</script>

<template >
  <!------Sidebar-------->
  <v-navigation-drawer
    left
    elevation="1"
    app
    class="leftSidebar"
    v-model="sDrawer"
    width="270"

    border="start end"
  :style="{ '--v-border-opacity': 0.85 }"

  >
    <!---Logo part -->
    <div class="pa-5">
      <LayoutFullLogo />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <div>
      <perfect-scrollbar class="scrollnavbar">
        <v-list class="pa-6">
          <!---Menu Loop -->
          <template v-for="(item, i) in sidebarMenu">
            <!---Item Sub Header -->
            <LayoutFullVerticalSidebarNavGroup
              :item="item"
              v-if="item.header"
              :key="item.title"
            />

            <!---If Has Child -->
            <LayoutFullVerticalSidebarNavCollapse
              class="leftPadding"
              :item="item"
              :level="0"
              v-else-if="item.children"
            />

            <!---Single Item-->
            <LayoutFullVerticalSidebarNavItem
              :item="item"
              v-else
              class="leftPadding"
            />
            <!---End Single Item-->
          </template>
        </v-list>
      </perfect-scrollbar>
    </div>
  </v-navigation-drawer>
  <!------Header-------->
  <v-app-bar
      height="70"
      class="top-header"
      flat
      scroll-behavior="elevate"
      :scroll-threshold="12"
      :elevation="2"
  >


    <div class="d-flex align-center justify-space-between w-100 px-2">
      <!-- LEFT: menu + search -->
      <div class="d-flex align-center ga-3">
        <v-btn
            icon
            variant="text"
            density="comfortable"
            aria-label="Toggle menu"
            @click="$emit?.('toggle:drawer')"
        >
          <Menu2Icon size="22" stroke-width="1.5" />
        </v-btn>

        <v-btn icon variant="text" density="comfortable" aria-label="Search">
          <v-icon size="22">mdi-magnify</v-icon>
        </v-btn>
      </div>

      <!-- RIGHT: theme, language, cart, bell, avatar -->
      <div class="d-flex align-center ga-2">
        <!-- Theme -->
        <v-btn
            icon
            variant="text"
            density="comfortable"
            aria-label="Toggle theme"
            @click="toggle()"
            class="icon-btn"
        >
          <v-icon size="22">{{ themeIcon }}</v-icon>
        </v-btn>



        <!-- Cart with badge -->
        <v-badge v-if="cartCount" :content="cartCount" offset-x="2" offset-y="2">
          <v-btn icon variant="text" density="comfortable" aria-label="Cart" class="icon-btn">
            <v-icon size="22">mdi-cart-outline</v-icon>
          </v-btn>
        </v-badge>
        <v-btn v-else icon variant="text" density="comfortable" aria-label="Cart" class="icon-btn">
          <v-icon size="22">mdi-cart-outline</v-icon>
        </v-btn>

        <!-- Notifications with dot -->
        <v-badge v-if="hasNewNotifs" dot color="primary" offset-x="2" offset-y="2">
          <v-btn icon variant="text" density="comfortable" aria-label="Notifications" class="icon-btn">
            <v-icon size="22">mdi-bell-outline</v-icon>
          </v-btn>
        </v-badge>
        <v-btn v-else icon variant="text" density="comfortable" aria-label="Notifications" class="icon-btn">
          <v-icon size="22">mdi-bell-outline</v-icon>
        </v-btn>

        <!-- Avatar / profile dropdown -->
        <LayoutFullVerticalHeaderProfileDD />
      </div>
    </div>
  </v-app-bar>
</template>
<style scoped>


/* nicer hit-area + smooth hover without heavy backgrounds */
.icon-btn :deep(.v-btn__overlay) {
  opacity: 0 !important;
}
.icon-btn {
  --btn-size: 36px;
  width: var(--btn-size);
  height: var(--btn-size);
  border-radius: 999px;
}
.icon-btn:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  transition: background-color .2s ease;
}

.flag {
  font-size: 18px;
  line-height: 1;
  display: inline-block;
}
</style>