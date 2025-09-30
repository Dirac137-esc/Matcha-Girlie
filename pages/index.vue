<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

/* ===== Types ===== */
type Category = 'all' | 'нунтаг' | 'хэрэгсэл' | 'амттан' | 'ундаа'
interface Product {
  id: string
  name: string
  subtitle?: string
  image: string
  price: number
  oldPrice?: number
  rating: number
  reviews: number
  category: Exclude<Category, 'all'>
}

/* ===== Config ===== */
const API_BASE = import.meta.env?.VITE_API_BASE ?? 'http://localhost:4000/api/v1'
const QUERY_LIMIT = 100
const FIELDS = [
  'title','description','price','oldPrice','images',
  'ratingAvg','reviewsCount','category'
].join(',')

const FALLBACK_IMG = 'https://placehold.co/600x400?text=Matcha'

/* ===== State ===== */
const search = ref('')
const selectedCategory = ref<Category>('all')
const visibleCount = ref(12)
const isLoading = ref(false)
const errorMsg = ref('')

/* ===== UI categories ===== */
const categories = [
  { value: 'all',      label: 'Бүгд' },
  { value: 'нунтаг',   label: 'Нунтаг' },
  { value: 'хэрэгсэл', label: 'Хэрэгсэл' },
  { value: 'амттан',   label: 'Амттан' },
  { value: 'ундаа',    label: 'Ундаа' },
] as const

/* ===== Data ===== */
const products = ref<Product[]>([])

/* ===== Helpers ===== */
type ApiProduct = {
  _id: string
  title: string
  description?: string
  price: number
  oldPrice?: number
  images?: string[]
  ratingAvg?: number
  reviewsCount?: number
  category?: { name?: string }
}
type ApiResponse<T> = { success: boolean; data: T; message?: string }

const searchLower = computed(() => search.value.trim().toLowerCase())

function formatMNT(n?: number) {
  if (typeof n !== 'number') return ''
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency', currency: 'MNT', maximumFractionDigits: 0
  }).format(n)
}

function mapApiProduct(p: ApiProduct): Product | null {
  const cat = (p.category?.name || '').trim() as Exclude<Category, 'all'>
  if (!cat) return null
  return {
    id: p._id,
    name: p.title,
    subtitle: p.description,
    image: p.images?.[0] || FALLBACK_IMG,
    price: p.price,
    oldPrice: p.oldPrice,
    rating: Math.round((p.ratingAvg ?? 0) * 10) / 10,
    reviews: p.reviewsCount ?? 0,
    category: cat,
  }
}

/* ===== Fetch ===== */
let controller: AbortController | null = null

async function loadProducts() {
  controller?.abort()
  controller = new AbortController()

  isLoading.value = true
  errorMsg.value = ''

  try {
    const url = new URL(`${API_BASE}/products`)
    url.searchParams.set('limit', String(QUERY_LIMIT))
    url.searchParams.set('sort', '-createdAt')
    url.searchParams.set('fields', FIELDS)

    // Public endpoint → no credentials to avoid CORS issues
    const resp = await fetch(url.toString(), { signal: controller.signal })
    const json = (await resp.json()) as ApiResponse<ApiProduct[]>
    if (!resp.ok || !json?.success) throw new Error(json?.message || `HTTP ${resp.status}`)

    const mapped = (json.data || [])
        .map(mapApiProduct)
        .filter((x): x is Product => !!x)

    products.value = mapped
    visibleCount.value = Math.min(12, mapped.length || 12)
  } catch (e: any) {
    if (e?.name === 'AbortError') return
    console.error('[loadProducts]', e)
    errorMsg.value = e?.message || 'Алдаа гарлаа.'
  } finally {
    isLoading.value = false
  }
}

/* ===== Derived ===== */
const catCounts = computed<Record<Category, number>>(() => {
  const map: Record<Category, number> = { all: products.value.length, нунтаг: 0, хэрэгсэл: 0, амттан: 0, ундаа: 0 }
  for (const p of products.value) map[p.category]++
  return map
})

const filtered = computed(() => {
  if (!searchLower.value && selectedCategory.value === 'all') return products.value
  return products.value.filter(p => {
    const inCat = selectedCategory.value === 'all' || p.category === selectedCategory.value
    if (!inCat) return false
    if (!searchLower.value) return true
    return p.name.toLowerCase().includes(searchLower.value) ||
        (p.subtitle?.toLowerCase().includes(searchLower.value) ?? false)
  })
})

const paginated = computed(() => filtered.value.slice(0, visibleCount.value))

/* ===== Lifecycle ===== */
onMounted(loadProducts)
onBeforeUnmount(() => controller?.abort())

/* Reset paging on filter/search */
watch([selectedCategory, search], () => {
  visibleCount.value = Math.min(12, filtered.value.length || 12)
})

/* Expose formatting for template */
const fmt = { price: formatMNT }
import { useCart } from '@/composables/useCart'


const { add } = useCart()

// per-card refs to the image (for animation start)
const imgMap = new Map<string, HTMLElement>()
const setImgRef = (id: string) => (el: any) => {
  // v-img exposes a root element; grab underlying <img>
  const node = el?.$el?.querySelector('img') ?? el?.$el ?? el ?? null
  if (node) imgMap.set(id, node as HTMLElement)
  else imgMap.delete(id)
}

// transient “added” flag per id (for ✓ overlay)
const added = ref<Record<string, boolean>>({})

// animation helpers
function cartBump() {
  const btn = document.getElementById('cart-btn')
  if (!btn) return
  btn.classList.add('cart-bump')
  setTimeout(() => btn.classList.remove('cart-bump'), 300)
}

function flyToCart(fromEl: HTMLElement, toEl: HTMLElement) {
  const s = fromEl.getBoundingClientRect()
  const e = toEl.getBoundingClientRect()
  const clone = fromEl.cloneNode(true) as HTMLElement
  Object.assign(clone.style, {
    position: 'fixed',
    left: s.left + 'px',
    top: s.top + 'px',
    width: s.width + 'px',
    height: s.height + 'px',
    zIndex: 9999,
    borderRadius: '12px',
    pointerEvents: 'none',
    overflow: 'hidden',
    transform: 'translate(0,0) scale(1)',
    opacity: '1'
  })
  document.body.appendChild(clone)

  const dx = e.left + e.width / 2 - (s.left + s.width / 2)
  const dy = e.top + e.height / 2 - (s.top + s.height / 2)

  const anim = clone.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.3 }
      ],
      { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)' }
  )
  anim.onfinish = () => { clone.remove(); cartBump() }
}

function onAddToCart(p: Product) {
  // 1) add to cart (persisted by useCart via localStorage)
  add({ id: p.id, title: p.name, subtitle: p.subtitle, price: p.price, img: p.image }, 1)

  // 2) ✓ overlay on the card
  added.value[p.id] = true
  setTimeout(() => { delete added.value[p.id] }, 900)

  // 3) fly image to cart
  const imgEl = imgMap.get(p.id)
  const cartEl = document.getElementById('cart-btn')
  if (imgEl && cartEl) flyToCart(imgEl, cartEl)
}
import { useRouter } from 'vue-router'
const router = useRouter()
function goDetail(p: Product) {
  router.push({ path: '/detail', query: { id: p.id } })
}
</script>



<template>
  <v-container fluid class="page-wrapper">
    <div class="maxWidth">
      <v-card variant="flat" class="rounded-xl z-auto">
        <v-row no-gutters>
          <!-- ===== Sidebar (Ангилал – pro pill list) ===== -->
          <v-col cols="12" md="3" lg="3" xl="2" class="sidebar-wrap">
            <v-sheet class="sidebar-card" rounded="xl" elevation="0">
              <div class="section-head mb-2">
                <span class="section-title">Ангилал</span>
              </div>

              <ul class="navcat" role="list">
                <li v-for="c in categories" :key="c.value">
                  <button
                      class="navitem"
                      :class="{ active: selectedCategory === c.value }"
                      @click="selectedCategory = c.value"
                      :aria-current="selectedCategory === c.value ? 'page' : undefined"
                      type="button"
                  >
                    <span class="dot" aria-hidden="true"></span>
                    <span class="label">{{ c.label }}</span>
                    <span class="count" :class="{ 'count--active': selectedCategory === c.value }">
                      {{ catCounts[c.value as Category] }}
                    </span>
                  </button>
                </li>
              </ul>
            </v-sheet>
          </v-col>

          <!-- ===== Products ===== -->
          <v-col cols="12" md="9" lg="9" xl="10" class="body-container">
            <div class="pa-5">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="h4 mb-0">Бүтээгдэхүүн</div>
                <v-text-field
                    v-model="search"
                    variant="solo"
                    density="comfortable"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Хайх…"
                    hide-details
                    style="max-width: 320px"
                />
              </div>

              <v-row>
                <v-col
                    v-for="p in paginated"
                    :key="p.id"
                    cols="12" sm="6" lg="4"
                    class="d-flex"
                >
                  <!-- Hover effect: zoom + slide-up add bar -->
                  <v-card class="rounded-xl w-100 h-100 product-card" elevation="1">
                    <div class="img-wrap">
                      <v-img
                          :ref="setImgRef(p.id)" :src="p.image" :alt="p.name" height="200" cover class="img rounded-t-xl clickable"
                          @click="goDetail(p)" />
                      <button class="addbar overlay text-none bg-primary" @click="onAddToCart(p)">
                        САГСАНД ХИЙХ
                      </button>

                    </div>

                    <v-card-text class="py-3">
                      <!-- ⭐ matcha-colored, visible stars + review count -->
                      <div class="stars-row d-flex align-center ga-2 mb-2">
                        <v-rating
                            :model-value="p.rating"
                            length="5"
                            half-increments
                            readonly
                            color="primary"
                            empty-icon="mdi-star-outline"
                            full-icon="mdi-star"
                            half-icon="mdi-star-half-full"
                            size="18"
                            class="rating--matcha"
                        />
                        <span class="text-13 grey-text">({{ p.reviews }})</span>
                      </div>

                      <div class="d-flex align-start">
                        <div class="flex-grow-1 pr-2">
                          <div class="name clamp-1 clickable" @click="goDetail(p)">{{ p.name }}</div>
                          <div v-if="p.subtitle" class="sub grey-text clamp-1">{{ p.subtitle }}</div>
                        </div>
                        <div class="text-right ml-2">
                          <div class="price">{{ fmt.price(p.price) }}</div>
                          <div v-if="p.oldPrice" class="old-price">{{ fmt.price(p.oldPrice) }}</div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <div class="d-flex justify-center mt-4" v-if="visibleCount < filtered.length">
                <v-btn variant="flat" color="primary" @click="visibleCount += 6" prepend-icon="mdi-chevron-down">
                  Дараагийн бараа
                </v-btn>
              </div>
            </div>


          </v-col>
        </v-row>
      </v-card>
    </div>

<!--    <v-snackbar v-model="snackbar.show" timeout="2200" location="top right">-->
<!--      {{ snackbar.text }}-->
<!--      <template #actions>-->
<!--        <v-btn variant="text" @click="snackbar.show=false">Хаах</v-btn>-->
<!--      </template>-->
<!--    </v-snackbar>-->
  </v-container>
</template>

<style scoped>
/* ===== Sidebar ===== */
.sidebar-wrap { padding: 10px; }
.sidebar-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding: 20px;
  position: sticky; top: 16px;
}
.section-title { font-weight: 600; }

/* Stylish pro nav list */
.navcat { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.navitem{
  width: 100%; display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border: 0; background: transparent;
  border-radius: 12px; cursor: pointer;
  color: rgba(var(--v-theme-on-surface), .78);
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
}
.navitem:hover{ background: rgba(var(--v-theme-primary), .06); }
.navitem.active{
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 10%, transparent);
  color: rgb(var(--v-theme-primary));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, rgb(var(--v-theme-primary)) 22%, transparent);
}
.dot{
  width: 8px; height: 8px; border-radius: 50%;
  border: 2px solid currentColor;
  display: inline-block; flex: 0 0 auto;
}
.label{ font-weight: 600; flex: 1; text-align: left; }
.count{
  flex: 0 0 auto;
  font-size: 12px; font-weight: 700; line-height: 1;
  padding: 6px 8px; border-radius: 9999px;
  background: #EFF4F0; color: #2F7B54; /* soft matcha badge */
}
.count--active{
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 16%, white);
  color: rgb(var(--v-theme-primary));
}

/* ===== Products ===== */
.body-container { border: 1px solid rgba(var(--v-theme-on-surface), 0.06); }
.product-card{
  border: 1px solid rgba(0,0,0,.06);
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
  overflow: hidden;
}
.product-card:hover{
  transform: translateY(-4px);
  box-shadow: var(--v-shadow-8);
  border-color: rgba(0,0,0,.08);
}

/* image + overlay add bar */
.img-wrap{ position: relative; overflow: hidden; }
.img{ transition: transform .35s ease; }
.product-card:hover .img{ transform: scale(1.06); }

/* slide-up bar */
.addbar.overlay{
  position: absolute; left: 0; right: 0; bottom: 0;
  transform: translateY(100%);
  text-align:center; font-weight:700; letter-spacing:.4px;
  padding: 12px 14px; border: 0;
  transition: transform .28s cubic-bezier(.2,.8,.2,1);
}
.product-card:hover .addbar.overlay,
.product-card:focus-within .addbar.overlay{ transform: translateY(0); }

/* content */
.name { font-weight: 600; line-height: 1.2; }
.sub { font-size: 13px; }
.grey-text { opacity: .7; }
.price { font-weight: 700; white-space: nowrap; }
.old-price { text-decoration: line-through; opacity: .6; font-size: 12px; margin-top: 2px; text-align: right; }

/* ⭐ Ensure stars show & use matcha (primary) */
.stars-row :deep(.v-icon){ opacity: 1 !important; }
.rating--matcha :deep(.v-icon){ color: rgb(var(--v-theme-primary)) !important; }

/* helpers */
.clamp-1{
  display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;
}
.text-13 { font-size: 13px; }

/* responsive */
@media (max-width: 960px){
  .sidebar-wrap{ padding:12px; }
  .sidebar-card{ border-radius:14px; }
}
/* bump animation for cart button */
#cart-btn.cart-bump { animation: cart-bump 300ms ease; }
@keyframes cart-bump {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* ✓ pill that fades in/out over the image */
.added-pill{
  position: absolute;
  left: 12px; bottom: 12px;
  display: inline-flex; align-items: center;
  padding: 6px 10px;
  background: rgba(47, 123, 84, 0.95);
  color: white; border-radius: 999px;
  font-size: 12px; font-weight: 700;
  animation: fade-pop 900ms ease forwards;
}
@keyframes fade-pop {
  0%   { transform: translateY(8px) scale(.95); opacity: 0; }
  15%  { transform: translateY(0)    scale(1);    opacity: 1; }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
.clickable { cursor: pointer; }

</style>
