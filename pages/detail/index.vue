<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '#imports'
import { useCart } from '@/composables/useCart'

/* ===== Config ===== */
const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:4000/api/v1'

/* ===== Route ===== */
const route = useRoute()
const idOrSlug = computed(() => (route.query.id as string) || (route.query.slug as string) || '')

/* ===== Types ===== */
type ApiProduct = {
  _id: string
  title: string
  description?: string
  images?: string[]
  price: number
  oldPrice?: number
  stock?: number
  ratingAvg?: number
  reviewsCount?: number
  category?: { name?: string }
}
type Review = {
  _id: string
  product: string
  rating: number
  comment: string
  user?: { name?: string } | null
  userName?: string
  createdAt?: string
}
type ApiResp<T> = { success: boolean; data: T; message?: string }

/* ===== State ===== */
const isLoading = ref(false)
const errorMsg = ref('')

const product = ref({
  id: '',
  title: '',
  category: '',
  inStock: true,
  oldPrice: 0,
  price: 0,
  rating: 0,
  reviews: 0,
  blurb: '',
  gallery: [] as string[],
})

/* Gallery / UI state */
const active = ref(0)
const carouselTransition = 'fade-transition'
const tab = ref<'desc' | 'rev'>('desc')

/* Colors (static swatches) */
const colors = [
  { key: 'peach',  hex: '#F28D79' },
  { key: 'orange', hex: '#F28C59' },
  { key: 'blue',   hex: '#2F7DB7' },
  { key: 'green',  hex: '#B5CD47' },
]
const selectedColor = ref(colors[3].key)

/* Qty & helpers */
const qty = ref(1)
const inc = () => (qty.value = Math.min(99, qty.value + 1))
const dec = () => (qty.value = Math.max(1, qty.value - 1))
const money = (n: number) =>
    new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT', maximumFractionDigits: 0 }).format(n)

/* ===== Reviews ===== */
const reviews = ref<Review[]>([])
const isLoadingReviews = ref(false)
const breakdown = ref<{ stars: number; count: number }[]>([
  { stars: 1, count: 0 },
  { stars: 2, count: 0 },
  { stars: 3, count: 0 },
  { stars: 4, count: 0 },
  { stars: 5, count: 0 },
])
const totalReviewsAll = computed(() => breakdown.value.reduce((a, b) => a + b.count, 0))
const pct = (n: number) => (totalReviewsAll.value ? (n / totalReviewsAll.value) * 100 : 0)

const displayRating = computed(() => {
  if (reviews.value.length === 0) return product.value.rating
  const avg = reviews.value.reduce((s, r) => s + (r.rating || 0), 0) / reviews.value.length
  return Math.round(avg * 10) / 10
})
const displayCount = computed(() => reviews.value.length || product.value.reviews)

async function loadReviews(pid: string) {
  isLoadingReviews.value = true
  try {
    const resp = await fetch(`${API_BASE}/reviews/product/${encodeURIComponent(pid)}`)
    const json = (await resp.json()) as ApiResp<Review[]>
    if (!resp.ok || !json?.success) throw new Error(json?.message || 'Сэтгэгдэл ачаалагдсангүй')
    reviews.value = json.data || []

    // Build distribution
    const counts = [0,0,0,0,0]
    for (const r of reviews.value) {
      const i = Math.min(5, Math.max(1, Math.round(r.rating))) - 1
      counts[i]++
    }
    breakdown.value = counts.map((c, i) => ({ stars: i + 1, count: c }))
  } finally {
    isLoadingReviews.value = false
  }
}

/* ===== Product fetch ===== */
async function loadProduct() {
  if (!idOrSlug.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    const url = new URL(`${API_BASE}/products/${encodeURIComponent(idOrSlug.value)}`)
    url.searchParams.set('fields', [
      'title','description','images','price','oldPrice',
      'stock','ratingAvg','reviewsCount','category'
    ].join(','))
    const resp = await fetch(url.toString())
    const json = (await resp.json()) as ApiResp<ApiProduct | null>
    if (!resp.ok || !json?.success || !json.data) throw new Error(json?.message || 'Бараа олдсонгүй')

    const p = json.data
    product.value = {
      id: p._id,
      title: p.title,
      category: p.category?.name || '',
      inStock: (p.stock ?? 0) > 0,
      oldPrice: p.oldPrice ?? 0,
      price: p.price,
      rating: Math.round((p.ratingAvg ?? 0) * 10) / 10,
      reviews: p.reviewsCount ?? 0,
      blurb: p.description || '',
      gallery: (p.images?.length ? p.images : ['https://placehold.co/1200x800?text=Matcha']),
    }
    useHead({ title: product.value.title || 'Бүтээгдэхүүн' })

    await loadReviews(product.value.id)
    active.value = 0
  } catch (e: any) {
    console.error('[detail] load error', e)
    errorMsg.value = e?.message || 'Алдаа гарлаа.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProduct)
watch(idOrSlug, loadProduct)

/* ===== Cart ===== */
const { add, openDrawer } = useCart()
const buyNow = () => {
  add({ id: product.value.id, title: product.value.title, price: product.value.price, img: product.value.gallery[0], subtitle: product.value.blurb }, qty.value)
  openDrawer()
}
const addToCart = () => {
  add({ id: product.value.id, title: product.value.title, price: product.value.price, img: product.value.gallery[0], subtitle: product.value.blurb }, qty.value)
}
</script>

<template>
  <v-container fluid class="page-wrapper">
    <div class="maxWidth">
      <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-4">
        {{ errorMsg }}
      </v-alert>
      <div v-if="isLoading" class="d-flex justify-center my-6">
        <v-progress-circular indeterminate />
      </div>

      <div class="matcha-hero" aria-hidden="true"></div>

      <v-card elevation="1" class="pa-3 pa-sm-5 matcha-border rounded-2xl" v-if="!isLoading && !errorMsg">
        <v-row no-gutters class="ga-8 no-wrap-lg" align="start">
          <!-- LEFT: GALLERY -->
          <v-col cols="12" lg="7" class="pr-lg-6">
            <v-sheet class="gallery rounded-2xl overflow-hidden">
              <div class="gallery-aspect">
                <v-carousel v-model="active" hide-delimiters class="rounded-2xl gallery-carousel"
                            :continuous="true" :cycle="false" :touch="true"
                            :hide-delimiter-background="true" :show-arrows="'always'"
                            :height="'100%'" :elevation="0"
                            :transition="carouselTransition" :reverse-transition="carouselTransition">
                  <v-carousel-item v-for="(src, i) in product.gallery" :key="src">
                    <v-img :src="src" alt="Бүтээгдэхүүний зураг" cover class="rounded-2xl" />
                  </v-carousel-item>
                  <template #prev="{ props }">
                    <v-btn v-bind="props" icon density="comfortable" variant="flat" class="nav-btn left" aria-label="Өмнөх">
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                  </template>
                  <template #next="{ props }">
                    <v-btn v-bind="props" icon density="comfortable" variant="flat" class="nav-btn right" aria-label="Дараах">
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </template>
                </v-carousel>
              </div>
            </v-sheet>

            <v-slide-group v-model="active" class="mt-4" show-arrows center-active :ripple="false">
              <v-slide-group-item v-for="(src, i) in product.gallery" :key="src" :value="i" v-slot="{ isSelected, toggle }">
                <v-sheet class="thumb rounded-xl mr-3" :class="{ 'thumb--active': isSelected }" elevation="1" @click="toggle()">
                  <v-img :src="src" cover alt="Жижиг зураг" />
                </v-sheet>
              </v-slide-group-item>
            </v-slide-group>
          </v-col>

          <!-- RIGHT: DETAILS -->
          <v-col cols="12" lg="5">
            <div class="details">
              <div class="d-flex align-center ga-3 mb-2">
                <v-chip size="small" label :color="product.inStock ? 'success' : 'error'">
                  {{ product.inStock ? 'Бэлэн' : 'Дууссан' }}
                </v-chip>
                <v-chip v-if="product.category" size="small" label color="lightprimary" variant="flat" class="text-primary">
                  {{ product.category }}
                </v-chip>
              </div>

              <h1 class="text-lg-h4 text-high-emphasis mb-2">{{ product.title }}</h1>
              <p class="text-body-2 text-medium-emphasis mb-4">{{ product.blurb }}</p>

              <div class="d-flex align-end ga-3 mb-1">
                <div v-if="product.oldPrice" class="text-subtitle-1 text-disabled"><del>{{ money(product.oldPrice) }}</del></div>
                <div class="text-h6 font-weight-bold">{{ money(product.price) }}</div>
              </div>

              <div class="d-flex align-center ga-2 mb-4 force-stars">
                <v-rating :model-value="displayRating" length="5" half-increments readonly color="primary"
                          empty-icon="mdi-star-outline" full-icon="mdi-star" half-icon="mdi-star-half-full"
                          size="20" class="rating--matcha" />
                <span class="text-caption text-medium-emphasis">({{ displayCount }} сэтгэгдэл)</span>
              </div>


              <div class="mb-6">
                <div class="text-subtitle-2 mb-2">Тоо ширхэг</div>
                <div class="qty d-inline-flex align-center">
                  <v-btn icon variant="text" density="comfortable" class="qty__btn matcha-border--thin" aria-label="Бууруулах" @click="dec">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <div class="qty__box text-subtitle-2 matcha-border--thin">{{ qty }}</div>
                  <v-btn icon variant="text" density="comfortable" class="qty__btn matcha-border--thin" aria-label="Нэмэгдүүлэх" @click="inc">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>

              <v-divider class="my-4" :thickness="1" color="on-surface" style="opacity:.18" />

              <div class="d-flex gap-3 align-center flex-column flex-wrap flex-xl-nowrap flex-sm-row fill-height">
                <v-btn class="cta flex-1 text-none" size="large" rounded="lg" color="primary" @click="addToCart">
                  Сагсанд нэмэх
                </v-btn>

              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- Tabs -->
      <v-card class="mt-6 matcha-border rounded-2xl" variant="elevated" elevation="1" v-if="!isLoading && !errorMsg">
        <div class="px-4 pt-2 tabs-header">
          <v-tabs v-model="tab" align-tabs="start" color="primary" slider-color="primary">
            <v-tab class="text-none" value="desc">Мэдээлэл</v-tab>
            <v-tab class="text-none" value="rev">Сэтгэгдэл</v-tab>
          </v-tabs>
        </div>
        <v-divider class="my-4" :thickness="1" color="on-surface" style="opacity:.18" />

        <v-window v-model="tab">
          <v-window-item value="desc">
            <v-card flat class="pa-6 pa-sm-8">
              <h3 class="text-h5 text-high-emphasis mb-4">Яагаад Матча?</h3>
              <p class="text-body-1 text-medium-emphasis">
                {{ product.blurb || 'Матча нь L-теанин + кофеин агуулсан тул тайван төвлөрөхөд тусална.' }}
              </p>
            </v-card>
          </v-window-item>

          <v-window-item value="rev">
            <v-card flat class="pa-4 pa-sm-6">
              <v-row class="ga-6 justify-center" align="stretch">
                <!-- Average -->
                <v-col cols="12" md="3">
                  <v-card elevation="0" class="h-100 matcha-border rounded-xl">
                    <v-card-text class="text-center py-8">
                      <div class="text-subtitle-2 text-medium-emphasis mb-2">Дундаж үнэлгээ</div>
                      <div class="text-h2 text-primary font-weight-bold mb-2">
                        {{ displayRating }}/5
                      </div>
                      <div class="d-flex justify-center force-stars">
                        <v-rating :model-value="displayRating" length="5" half-increments readonly color="primary"
                                  empty-icon="mdi-star-outline" full-icon="mdi-star" half-icon="mdi-star-half-full"
                                  size="24" class="rating--matcha" />
                      </div>
                      <div class="text-caption text-medium-emphasis mt-2">({{ displayCount }} сэтгэгдэл)</div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Distribution -->
                <v-col cols="12" md="4">
                  <v-card elevation="0" class="h-100 matcha-border rounded-xl">
                    <v-card-text class="py-6">
                      <v-row v-for="row in breakdown" :key="row.stars" class="align-center mb-4" no-gutters>
                        <v-col cols="3" class="text-body-2 text-medium-emphasis text-no-wrap">{{ row.stars }} од</v-col>
                        <v-col cols="7">
                          <v-progress-linear :model-value="pct(row.count)" height="5" rounded color="primary"
                                             :bg-color="'primary'" :bg-opacity="0.10" />
                        </v-col>
                        <v-col cols="2" class="text-body-2 text-medium-emphasis text-right">({{ row.count }})</v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Reviews list -->
                <v-col cols="12" md="5">
                  <div v-if="isLoadingReviews" class="d-flex justify-center my-4">
                    <v-progress-circular indeterminate />
                  </div>
                  <v-list v-else lines="two" class="px-2">
                    <v-list-item v-for="r in reviews" :key="r._id" class="rounded-lg mb-2 matcha-border">
                      <template #prepend>
                        <v-avatar size="36" color="primary">
                          {{ (r.user?.name || r.userName || 'Зочин').slice(0,1).toUpperCase() }}
                        </v-avatar>
                      </template>
                      <v-list-item-title class="d-flex align-center ga-2">
                        <span class="font-weight-600">{{ r.user?.name || r.userName || 'Зочин' }}</span>
                        <v-rating :model-value="r.rating" length="5" half-increments readonly size="16" color="primary" />
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 mt-1">
                        {{ r.comment }}
                      </v-list-item-subtitle>
                      <template #append>
                        <span class="text-caption text-medium-emphasis">
                          {{ new Date(r.createdAt || '').toLocaleDateString('mn-MN') }}
                        </span>
                      </template>
                    </v-list-item>
                    <div v-if="!reviews.length" class="text-body-2 text-medium-emphasis pa-4">
                      Одоогоор сэтгэгдэл алга.
                    </div>
                  </v-list>
                </v-col>
              </v-row>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
@media (min-width: 1280px) { .no-wrap-lg { flex-wrap: nowrap; } }
.matcha-hero{
  position: absolute; inset: 0 0 auto 0; height: 180px; z-index: 0;
  background:
      radial-gradient(80% 60% at 10% 30%, rgba(47,123,84,.10), transparent 60%),
      radial-gradient(60% 60% at 90% 20%, rgba(143,209,158,.14), transparent 60%);
}
.matcha-border{ border: 1px solid rgba(var(--v-theme-on-surface), 0.09); }
.matcha-border--thin{ border: 1px solid rgba(var(--v-theme-on-surface), 0.12); }
.gallery-aspect { aspect-ratio: 16 / 10; }
.gallery :deep(.v-carousel) { height: 100%; }
.nav-btn{ position: absolute; top: 50%; transform: translateY(-50%); --size: 44px; width: var(--size); height: var(--size);
  background: color-mix(in oklab, rgb(var(--v-theme-surface)) 72%, transparent);
  box-shadow: 0 6px 18px rgba(0,0,0,.12);
  backdrop-filter: saturate(1.1) blur(4px);
  transition: transform .15s ease, box-shadow .15s ease; }
.nav-btn.left{ left: 12px; } .nav-btn.right{ right: 12px; }
.nav-btn:hover{ transform: translateY(-50%) scale(1.06); box-shadow: 0 10px 24px rgba(0,0,0,.18); }
.thumb{ width: 140px; height: 92px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: transform .15s ease, border-color .15s ease; }
.thumb--active{ border-color: rgb(var(--v-theme-primary)); }
.thumb:hover{ transform: translateY(-2px); }
.details{ position: sticky; top: 12px; z-index: 1; }
.force-stars :deep(.v-icon){ opacity: 1 !important; }
.rating--matcha :deep(.v-icon){ color: rgb(var(--v-theme-primary)) !important; }
.swatch{ width: 34px; height: 34px; min-width: 34px; border-radius: 9999px; color: white;
  box-shadow: 0 0 0 2px #fff inset, 0 1px 2px rgba(0,0,0,.06), 0 0 0 2px rgba(0,0,0,.05); transition: transform .12s ease; }
.swatch--active{ outline: 2px solid rgb(var(--v-theme-primary)); }
.swatch:active{ transform: scale(.96); }
.qty{ overflow: hidden; } .qty__btn{ width: 38px; height: 44px; } .qty__box{ width: 44px; text-align: center; padding: 10px 0; border-inline: 1px solid var(--v-border-color, rgba(0,0,0,.12)); }
.tabs-header :deep(.v-tab){ text-transform: none; font-weight: 600; letter-spacing: .2px; border-radius: 12px; margin-right: 8px; }
.tabs-header :deep(.v-tab--selected){ background: color-mix(in oklab, rgb(var(--v-theme-primary)) 10%, transparent); }
.rounded-2xl{ border-radius: 16px; }
</style>
