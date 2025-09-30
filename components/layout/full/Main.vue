<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import sidebarItems from '@/components/layout/full/vertical-sidebar/sidebarItem'
import { Menu2Icon } from 'vue-tabler-icons'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useCart } from '@/composables/useCart'

const sidebarMenu = shallowRef(sidebarItems)
const sDrawer = ref(true)

/* === Cart store === */
const {
  items: cartItems,
  count: cartCount,
  subtotal,
  drawer: cartDrawer,
  inc, dec, removeItem, toggleDrawer
} = useCart()

const toggleCartDrawer = toggleDrawer

const hasNewNotifs = ref(true)
const newCount = ref(5)

const money = (n: number) =>
    new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT', minimumFractionDigits: 0 }).format(n)

const total = computed(() => subtotal.value)
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


        <!-- Cart -->
        <v-badge
            :content="cartCount"
            offset-x="2"
            offset-y="2"
            color="orange"
            text-color="white"
            v-if="cartCount !== null"
        >
          <v-btn  id="cart-btn"  icon variant="text" density="comfortable" aria-label="Cart" class="icon-btn" @click="toggleCartDrawer">
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


  <v-navigation-drawer
      v-model="cartDrawer"
      temporary
      location="right"
      width="360"
      elevation="10"
      class="cart-drawer cart-drawer--compact"
  >
    <!-- Header -->
    <div class="d-flex align-center justify-space-between px-4 pr-6 py-4">
      <div class="text-subtitle-1 font-weight-bold">Таны сагс</div>
      <div class="d-flex align-center ga-2">
        <v-chip v-if="cartCount" size="medium" color="primary" text-color="white" class="px-3" label>
          {{ cartCount }} шинэ
        </v-chip>

      </div>
    </div>

    <v-divider class="mb-1" />

    <!-- Items -->
    <div class="px-4">
      <div v-for="it in cartItems" :key="it.id" class="d-flex ga-3 align-start py-3">
        <v-avatar size="64" rounded="lg" class="elevation-1">
          <v-img :src="it.img" alt="" cover />
        </v-avatar>

        <div class="flex-grow-1 min-w-0">
          <div class="text-body-2 font-weight-medium text-truncate">{{ it.title }}</div>
          <div class="text-caption text-medium-emphasis mb-2">{{ it.subtitle }}</div>

          <div class="d-flex align-center justify-space-between">
            <div class="text-body-2 font-weight-medium">{{ money(it.price) }}</div>

            <!-- XS qty controls -->
            <div class="d-flex align-center ga-1">
              <v-btn class="qty-btn--xs" variant="tonal" color="surface-variant" @click="dec(it.id)">
                <v-icon size="14">mdi-minus</v-icon>
              </v-btn>
              <v-sheet class="qty-value--xs">{{ it.qty }}</v-sheet>
              <v-btn class="qty-btn--xs" variant="tonal" color="surface-variant" @click="inc(it.id)">
                <v-icon size="14">mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Remove -->
        <v-btn icon variant="text" color="error" size="small" @click="removeItem(it.id)">
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </div>
    </div>
    <div v-if="!cartItems.length" class="text-body-2 text-medium-emphasis py-6 text-center">
      Сагс хоосон байна.
    </div>

    <v-divider class="my-2" />

    <!-- Totals -->
    <!-- Totals -->
    <div class="px-4 pb-4 pt-2">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-body-2 text-medium-emphasis">Нийт</div>
        <div class="text-subtitle-1 font-weight-bold">{{ money(subtotal) }}</div>
      </div>

      <v-btn
          block
          variant="outlined"
          color="primary"
          class="rounded-lg text-none py-3"
          :disabled="!cartItems.length"
          @click="cartDrawer = false; $router.push('/order')"
      >
        Худалдан авах
      </v-btn>
    </div>

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
.cart-drawer--compact :deep(.v-navigation-drawer__content){
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
}

/* smaller +/- buttons */
.qty-btn--xs{
  width: 24px;
  height: 24px;
  border-radius: 6px;
  min-width: 24px; /* keep Vuetify from stretching */
  padding: 0;
}
.qty-value--xs{
  min-width: 26px;
  height: 24px;
  border: 1px solid rgba(var(--v-theme-outline), .22);
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
}

/* give the close button room from the right wall */
.close-btn{
  margin-right: 8px;  /* extra breathing room */
}


</style>
