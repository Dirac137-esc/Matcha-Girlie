<script setup lang="ts">
import { ref, shallowRef, computed } from "vue";
import sidebarItems from "@/components/layout/full/vertical-sidebar/sidebarItem";
import { Menu2Icon } from "vue-tabler-icons";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import { useThemeSwitcher } from '@/composables/useThemeSwitcher'

const sidebarMenu = shallowRef(sidebarItems);
const sDrawer = ref(true);

const { toggle, label } = useThemeSwitcher();

const cartCount = ref(2);
const hasNewNotifs = ref(true);

const cartDrawer = ref(false);
const toggleCartDrawer = () => (cartDrawer.value = !cartDrawer.value);

const themeIcon = computed(() =>
    String(label?.value ?? '').toLowerCase().includes('dark')
        ? 'mdi-moon-waxing-crescent'
        : 'mdi-weather-sunny'
);
</script>

<template>
  <!-- Sidebar -->
  <v-navigation-drawer
      left
      app
      elevation="1"
      v-model="sDrawer"
      width="270"
      class="leftSidebar"
      border="start end"
      :style="{ '--v-border-opacity': 0.85 }"
  >
    <div class="pa-4">
      <LayoutFullLogo />
    </div>
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-6">
        <template v-for="(item, i) in sidebarMenu" :key="item.title">
          <LayoutFullVerticalSidebarNavGroup v-if="item.header" :item="item" />
          <LayoutFullVerticalSidebarNavCollapse v-else-if="item.children" :item="item" :level="0" class="leftPadding" />
          <LayoutFullVerticalSidebarNavItem v-else :item="item" class="leftPadding" />
        </template>
      </v-list>
    </perfect-scrollbar>
  </v-navigation-drawer>

  <!-- Header -->
  <v-app-bar height="70" flat scroll-behavior="elevate" :scroll-threshold="12" :elevation="2" class="top-header">
    <div class="d-flex align-center justify-space-between w-100 px-2">
      <!-- LEFT: menu + search -->
      <div class="d-flex align-center ga-3">
        <v-btn icon variant="text" density="comfortable" aria-label="Toggle menu" @click="$emit?.('toggle:drawer')">
          <Menu2Icon size="22" stroke-width="1.5" />
        </v-btn>
        <v-btn icon variant="text" density="comfortable" aria-label="Search">
          <v-icon size="22">mdi-magnify</v-icon>
        </v-btn>
      </div>

      <!-- RIGHT: theme, cart, notifications, avatar -->
      <div class="d-flex align-center ga-4">
        <!-- Theme -->
        <v-btn icon variant="text" density="comfortable" aria-label="Toggle theme" @click="toggle()" class="icon-btn">
          <v-icon size="22">{{ themeIcon }}</v-icon>
        </v-btn>

        <!-- Cart -->
        <v-badge
            :content="cartCount"
            offset-x="2"
            offset-y="2"
            color="orange"
            text-color="white"
            v-if="cartCount !== null"
        >
          <v-btn icon variant="text" density="comfortable" aria-label="Cart" class="icon-btn" @click="toggleCartDrawer">
            <v-icon size="22">mdi-cart-outline</v-icon>
          </v-btn>
        </v-badge>
        <v-btn v-else icon variant="text" density="comfortable" aria-label="Cart" class="icon-btn" @click="toggleCartDrawer">
          <v-icon size="22">mdi-cart-outline</v-icon>
        </v-btn>

        <!-- Notifications -->
        <v-badge v-if="hasNewNotifs" dot color="primary" offset-x="2" offset-y="2">
          <v-btn icon variant="text" density="comfortable" aria-label="Notifications" class="icon-btn">
            <v-icon size="22">mdi-bell-outline</v-icon>
          </v-btn>
        </v-badge>
        <v-btn v-else icon variant="text" density="comfortable" aria-label="Notifications" class="icon-btn">
          <v-icon size="22">mdi-bell-outline</v-icon>
        </v-btn>

        <!-- Avatar -->
        <LayoutFullVerticalHeaderProfileDD />
      </div>
    </div>
  </v-app-bar>

  <!-- Cart Drawer -->
  <v-navigation-drawer v-model="cartDrawer" temporary location="right">
    <v-list-item prepend-avatar="https://randomuser.me/api/portraits/men/78.jpg" title="John Leider"></v-list-item>
    <v-divider></v-divider>
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-view-dashboard" title="Home" value="home"></v-list-item>
      <v-list-item prepend-icon="mdi-forum" title="About" value="about"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
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
  transition: background-color 0.2s ease;
}
.flag {
  font-size: 18px;
  line-height: 1;
  display: inline-block;
}
</style>
