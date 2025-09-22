<template>
  <v-container fluid class="page-wrapper">
    <div class="maxWidth">
      <!-- ===== Hero / Breadcrumb ===== -->
      <v-sheet class="rounded-lg mb-4" color="surface" variant="tonal">
        <div class="d-flex align-center justify-space-between px-6 py-6">
          <div>
            <div class="text-13 opacity-60 mb-1">Home • Shop</div>
            <h1 class="h2">Shop</h1>
          </div>
          <v-avatar size="80" class="d-none d-sm-flex">
            <v-img
                src="https://images.unsplash.com/photo-1512511708753-3159f3e9f94b?q=80&w=400&auto=format&fit=crop"
                alt="hero" cover
            />
          </v-avatar>
        </div>
      </v-sheet>

      <!-- ===== Main (Sidebar + Products) ===== -->
      <v-card variant="flat" class="rounded-xl z-auto">
        <v-row no-gutters>
          <!-- ==== Sidebar ==== -->
          <v-col cols="12" md="3" class="sidebar">
            <div class="pa-5">
              <!-- Category -->
              <div class="section-title mb-3">Filter by Category</div>
              <v-list nav density="comfortable" class="rounded-lg mb-6">
                <v-list-item
                    v-for="c in categories"
                    :key="c.value"
                    :value="c.value"
                    :active="selectedCategory === c.value"
                    @click="selectedCategory = c.value"
                >
                  <template #prepend>
                    <v-icon class="mr-3">{{ c.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ c.title }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <!-- Sort -->
              <div class="section-title mb-3">Sort By</div>
              <v-list nav density="comfortable" class="rounded-lg mb-6">
                <v-list-item
                    v-for="s in sortItems"
                    :key="s.value"
                    :active="sortBy === s.value"
                    @click="sortBy = s.value"
                >
                  <template #prepend>
                    <v-icon class="mr-3">{{ s.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ s.title }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <!-- Gender -->
              <div class="section-title mb-3">By Gender</div>
              <div class="d-flex flex-column mb-6">
                <v-checkbox
                    v-for="g in genders"
                    :key="g.value"
                    v-model="selectedGenders"
                    :label="g.label"
                    :value="g.value"
                    density="comfortable"
                    hide-details
                />
              </div>

              <!-- Pricing -->
              <div class="section-title mb-3">By Pricing</div>
              <v-radio-group v-model="priceBucket" hide-details>
                <v-radio
                    v-for="b in priceBuckets"
                    :key="b.value"
                    :label="b.label"
                    :value="b.value"
                    density="comfortable"
                />
              </v-radio-group>

              <!-- Colors -->
              <div class="section-title mt-6 mb-3">By Colors</div>
              <div class="d-flex align-center ga-3 flex-wrap mb-6">
                <button
                    v-for="c in colorOptions"
                    :key="c"
                    class="color-dot"
                    :class="[{ active: selectedColors.includes(c) }]"
                    :style="{ backgroundColor: c }"
                    @click="toggleColor(c)"
                    aria-label="Color filter"
                />
              </div>

              <v-btn
                  variant="outlined"
                  color="primary"
                  block
                  class="mt-2"
                  @click="resetFilters"
              >
                Reset Filters
              </v-btn>
            </div>
          </v-col>

          <!-- ==== Products ==== -->
          <v-col cols="12" md="9" class="body-container" >
            <div class="pa-5">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="h4 mb-0">Products</div>
                <v-text-field
                    v-model="search"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Search Product"
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
                  <v-card class="rounded-xl w-100 h-100 product-card" variant="flat" elevation="2">
                    <div class="position-relative">
                      <v-img
                          :src="p.image"
                          :alt="p.name"
                          height="220"
                          cover
                          class="rounded-t-xl"
                      />
                      <!-- tiny brand bubble -->
                      <v-avatar size="26" class="brand-bubble">
                        <span class="text-white text-12">tb</span>
                      </v-avatar>

                      <!-- add to cart -->
                      <v-btn
                          icon
                          class="cart-fab"
                          elevation="0"
                          color="primary"
                          @click="addToCart(p)"
                          :aria-label="`${p.name} add to cart`"
                      >
                        <v-icon>mdi-basket-outline</v-icon>
                      </v-btn>
                    </div>

                    <v-card-text class="py-4">
                      <div class="name clamp-1 mb-1">{{ p.name }}</div>

                      <div class="d-flex align-center ga-2 mb-1">
                        <div class="price">{{ formatUSD(p.price) }}</div>
                        <div v-if="p.oldPrice" class="old-price">
                          {{ formatUSD(p.oldPrice) }}
                        </div>
                      </div>

                      <div class="d-flex align-center ga-2">
                        <v-rating
                            v-model="p.rating"
                            readonly
                            density="compact"
                            size="18"
                            color="warning"
                            empty-icon="mdi-star-outline"
                            full-icon="mdi-star"
                        />
                        <span class="text-13 opacity-60">({{ p.reviews }})</span>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <div class="d-flex justify-center mt-4" v-if="visibleCount < filteredProducts.length">
                <v-btn variant="flat" color="primary" @click="visibleCount += 6" prepend-icon="mdi-chevron-down">
                  Load More
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" timeout="2200" location="top right">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show=false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Category = 'all' | 'fashion' | 'books' | 'toys' | 'electronics'
type Gender = 'all' | 'men' | 'women' | 'kids'
type PriceBucket = 'all' | '0-50' | '50-100' | '100-200' | '200+'

interface Product {
  id: number
  name: string
  image: string
  price: number
  oldPrice?: number
  rating: number
  reviews: number
  category: Exclude<Category, 'all'>
  gender: Exclude<Gender, 'all'>
  colors: string[] // hex
}

const search = ref('')
const selectedCategory = ref<Category>('all')
const sortBy = ref<'newest'|'price_low'|'price_high'|'discounted'>('newest')
const selectedGenders = ref<Gender[]>(['all'])
const priceBucket = ref<PriceBucket>('all')
const selectedColors = ref<string[]>([])
const visibleCount = ref(12)

const categories = [
  { title: 'All', value: 'all', icon: 'mdi-shape-outline' },
  { title: 'Fashion', value: 'fashion', icon: 'mdi-hanger' },
  { title: 'Books', value: 'books', icon: 'mdi-book-open-variant' },
  { title: 'Toys', value: 'toys', icon: 'mdi-puzzle-outline' },
  { title: 'Electronics', value: 'electronics', icon: 'mdi-monitor' },
]

const sortItems = [
  { title: 'Newest', value: 'newest', icon: 'mdi-history' },
  { title: 'Price: High–Low', value: 'price_high', icon: 'mdi-arrow-down-bold' },
  { title: 'Price: Low–High', value: 'price_low', icon: 'mdi-arrow-up-bold' },
  { title: 'Discounted', value: 'discounted', icon: 'mdi-sale-outline' },
]

const genders = [
  { label: 'All', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids', value: 'kids' },
]

const priceBuckets: { label: string; value: PriceBucket; min?: number; max?: number }[] = [
  { label: 'All', value: 'all' },
  { label: '0–50', value: '0-50', min: 0, max: 50 },
  { label: '50–100', value: '50-100', min: 50, max: 100 },
  { label: '100–200', value: '100-200', min: 100, max: 200 },
  { label: 'Over 200', value: '200+', min: 200 },
]

const colorOptions = ['#000000', '#f44336', '#ff9800', '#fdd835', '#4caf50', '#03a9f4', '#9c27b0', '#9e9e9e']

const products = ref<Product[]>([
  { id: 1,  name: 'Super Games',     image: 'https://images.unsplash.com/photo-1605901309584-818e25960a8b?q=80&w=1300&auto=format&fit=crop', price: 285, oldPrice: 345, rating: 4.6, reviews: 320, category: 'toys',        gender: 'kids',   colors: ['#000000', '#03a9f4'] },
  { id: 2,  name: 'Derma-E',         image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop', price: 650, oldPrice: 900, rating: 4.8, reviews: 210, category: 'electronics', gender: 'women', colors: ['#9e9e9e'] },
  { id: 3,  name: 'SockSoho',        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',   price: 25,  oldPrice: 31,  rating: 4.3, reviews: 112, category: 'fashion',    gender: 'men',   colors: ['#000000', '#f44336', '#03a9f4'] },
  { id: 4,  name: 'Glossy Solution', image: 'https://images.unsplash.com/photo-1518441902110-0f1e1a8f6b27?q=80&w=1200&auto=format&fit=crop', price: 50,  oldPrice: 65,  rating: 4.4, reviews: 61,  category: 'electronics', gender: 'women', colors: ['#ff9800', '#fdd835'] },
  { id: 5,  name: 'Supercolor 645CL',image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1200&auto=format&fit=crop',   price: 210, oldPrice: 250, rating: 4.7, reviews: 188, category: 'toys',        gender: 'kids',   colors: ['#4caf50'] },
  { id: 6,  name: 'Polraid One Step',image: 'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?q=80&w=1200&auto=format&fit=crop', price: 150, oldPrice: 200, rating: 4.5, reviews: 91,  category: 'fashion',    gender: 'women', colors: ['#9c27b0'] },
  { id: 7,  name: 'Colorful Camera', image: 'https://images.unsplash.com/photo-1495707902655-43e5f7c631ad?q=80&w=1200&auto=format&fit=crop', price: 300, oldPrice: 380, rating: 4.6, reviews: 77,  category: 'electronics', gender: 'men',   colors: ['#f44336', '#000000'] },
  { id: 8,  name: 'Orange Glass',    image: 'https://images.unsplash.com/photo-1533681018184-68bd1d883546?q=80&w=1200&auto=format&fit=crop', price: 175, oldPrice: 200, rating: 4.2, reviews: 45,  category: 'fashion',    gender: 'women', colors: ['#ff9800'] },
  { id: 9,  name: 'Smart Watch',     image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1200&auto=format&fit=crop', price: 125, oldPrice: 137, rating: 4.5, reviews: 156, category: 'electronics', gender: 'men',   colors: ['#000000', '#9e9e9e'] },
  { id:10,  name: 'Curolofy Face wash', image: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?q=80&w=1200&auto=format&fit=crop', price: 275, rating: 4.1, reviews: 23, category: 'fashion', gender: 'women', colors: ['#f44336', '#9c27b0'] },
  { id:11,  name: 'Smart Game',      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop', price: 5,   oldPrice: 10,  rating: 4.0, reviews: 9,   category: 'toys',        gender: 'kids',   colors: ['#9e9e9e', '#03a9f4'] },
  { id:12,  name: 'Body Lotion',     image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop', price: 89,  oldPrice: 99,  rating: 4.2, reviews: 33,  category: 'fashion',    gender: 'women', colors: ['#4caf50'] },
])

/* ===== Filtering ===== */
const filteredProducts = computed(() => {
  const q = search.value.trim().toLowerCase()
  const gendersActive = selectedGenders.value.includes('all')
      ? ['men','women','kids']
      : (selectedGenders.value as Exclude<Gender,'all'>[])

  const bucket = priceBuckets.find(b => b.value === priceBucket.value)

  return products.value.filter(p => {
    const inCat = selectedCategory.value === 'all' || p.category === selectedCategory.value
    const inSearch = !q || p.name.toLowerCase().includes(q)
    const inGender = gendersActive.includes(p.gender)
    const inPrice =
        !bucket?.min && !bucket?.max
            ? true
            : (bucket?.min ?? -Infinity) <= p.price && p.price <= (bucket?.max ?? Infinity)
    const inColor =
        !selectedColors.value.length ? true : selectedColors.value.some(c => p.colors.includes(c))

    return inCat && inSearch && inGender && inPrice && inColor
  })
})

/* ===== Sorting + Pagination ===== */
const sortedProducts = computed(() => {
  const arr = [...filteredProducts.value]
  switch (sortBy.value) {
    case 'price_low':  return arr.sort((a,b) => a.price - b.price)
    case 'price_high': return arr.sort((a,b) => b.price - a.price)
    case 'discounted': return arr.sort((a,b) => (b.oldPrice ? 1 : 0) - (a.oldPrice ? 1 : 0))
    default:           return arr.sort((a,b) => b.id - a.id)
  }
})
const paginated = computed(() => sortedProducts.value.slice(0, visibleCount.value))

/* ===== Helpers ===== */
function toggleColor(c: string) {
  const i = selectedColors.value.indexOf(c)
  if (i >= 0) selectedColors.value.splice(i, 1)
  else selectedColors.value.push(c)
}
function resetFilters() {
  search.value = ''
  selectedCategory.value = 'all'
  sortBy.value = 'newest'
  selectedGenders.value = ['all']
  priceBucket.value = 'all'
  selectedColors.value = []
  visibleCount.value = 12
}
function formatUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

/* mock add-to-cart */
const snackbar = ref({ show: false, text: '' })
function addToCart(p: Product) {
  snackbar.value = { show: true, text: `${p.name} added to cart.` }
}
</script>

<style scoped>
/* Layout */
.sidebar {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
.body-container {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}


/* Product card */
.product-card { transition: transform .18s ease, box-shadow .18s ease; }
.product-card:hover { transform: translateY(-2px); box-shadow: var(--v-shadow-4); }
.name { font-weight: 600; }
.price { font-weight: 700; }
.old-price { text-decoration: line-through; opacity: .6; }

/* Tiny brand circle like screenshot (bottom-right on image) */
.brand-bubble {
  position: absolute;
  right: 12px;
  bottom: 1px;
  background: #4c9aff; /* blue bubble */
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}

/* Cart FAB (top-right over image) */
.cart-fab {
  position: absolute;
  top: 12px;
  right: 12px;
}

/* Color dots */
.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,.08);
  cursor: pointer;
}
.color-dot.active {
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
}

/* Helpers */
.position-relative { position: relative; }
.text-12 { font-size: 12px; }

/* Make stars look orange like the screenshot */
:deep(.v-rating .v-icon) {
  --_star-color: #ffa321;
}
:deep(.v-rating .v-icon.v-icon--is-active) {
  color: var(--_star-color) !important;
}
</style>
