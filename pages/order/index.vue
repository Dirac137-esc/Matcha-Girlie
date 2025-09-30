<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'

/* ============ Cart (shared store) ============ */
const router = useRouter()
const { items, inc, dec, removeItem, subtotal } = useCart()

/* ============ Step Tabs ============ */
const tab = ref<'cart' | 'billing' | 'payment'>('cart')

/* ============ Address (saved in localStorage) ============ */
type AddressTag = 'Гэр' | 'Ажлын газар'
type Address = {
  id: number
  name: string
  tag: AddressTag
  phone: string
  line1: string
  city: string
  default?: boolean
}
const ADDR_KEY = 'matcha_addresses_v1'
const addresses = ref<Address[]>([])
const billingAddressId = ref<number | null>(null)
const shippingAddressId = ref<number | null>(null)

function loadAddresses() {
  try {
    const raw = localStorage.getItem(ADDR_KEY)
    addresses.value = raw ? (JSON.parse(raw) as Address[]) : []
  } catch { addresses.value = [] }

  ensureDefaultAddress()
  const def = addresses.value.find(a => a.default) ?? addresses.value[0]
  billingAddressId.value = def?.id ?? null
  shippingAddressId.value = def?.id ?? null
}
function saveAddresses() {
  try { localStorage.setItem(ADDR_KEY, JSON.stringify(addresses.value)) } catch {}
}
function ensureDefaultAddress() {
  if (!addresses.value.length) return
  const defs = addresses.value.filter(a => a.default)
  if (defs.length === 0) addresses.value[0].default = true
  if (defs.length > 1) {
    const firstId = defs[0].id
    addresses.value = addresses.value.map(a => ({ ...a, default: a.id === firstId }))
  }
}
onMounted(loadAddresses)
watch(addresses, () => { ensureDefaultAddress(); saveAddresses() }, { deep: true })

const billingAddress = computed(() => addresses.value.find(a => a.id === billingAddressId.value) || null)
const shippingAddress = computed(() => addresses.value.find(a => a.id === shippingAddressId.value) || null)

/* ---- Add Address Dialog ---- */
const addrDialog = ref(false)
type NewAddr = { name: string; tag: AddressTag; phone: string; line1: string; city: string; makeDefault: boolean }
const addrForm = ref<NewAddr>({ name: '', tag: 'Гэр', phone: '', line1: '', city: '', makeDefault: true })
function openAddrDialog() {
  addrForm.value = { name: '', tag: 'Гэр', phone: '', line1: '', city: '', makeDefault: !addresses.value.length }
  addrDialog.value = true
}
function saveAddress() {
  if (!addrForm.value.name.trim() || !addrForm.value.phone.trim() || !addrForm.value.line1.trim() || !addrForm.value.city.trim()) return
  const id = Date.now()
  const entry: Address = {
    id,
    name: addrForm.value.name.trim(),
    tag: addrForm.value.tag,
    phone: addrForm.value.phone.trim(),
    line1: addrForm.value.line1.trim(),
    city: addrForm.value.city.trim(),
    default: !!addrForm.value.makeDefault,
  }
  if (entry.default) addresses.value = addresses.value.map(a => ({ ...a, default: false }))
  addresses.value.unshift(entry)
  billingAddressId.value = id
  shippingAddressId.value = id
  addrDialog.value = false
}

/* ============ Payment / Delivery ============ */
const delivery = ref<'standard' | 'fast'>('standard')
const payMethod = ref<'qr' | 'card' | 'cod'>('qr')

/* Banks for “card” */
type BankKey = 'khaan' | 'golomt' | 'mbank'
const bank = ref<BankKey>('khaan')
const cardName = ref('')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')

/* Simple inline SVG logos */
const bankLogoSvg: Record<BankKey, string> = {
  khaan: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="10" fill="#007B3A"/><circle cx="32" cy="32" r="16" fill="#fff"/><circle cx="32" cy="32" r="8" fill="#007B3A"/></svg>`,
  golomt: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="10" fill="#0033A1"/><rect x="16" y="20" width="32" height="24" rx="4" fill="#FFC700"/><rect x="22" y="26" width="20" height="12" rx="2" fill="#0033A1"/></svg>`,
  mbank: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="10" fill="#111"/><path d="M12 46 L24 18 L36 46 L48 18" stroke="#00E676" stroke-width="6" fill="none" stroke-linecap="round"/></svg>`
}
const bankLogoUrl = (k: BankKey) => 'data:image/svg+xml;utf8,' + encodeURIComponent(bankLogoSvg[k])

/* ============ Totals ============ */
const discount = computed(() => Math.round(subtotal.value * 0.05))
const shippingCharge = computed(() => (delivery.value === 'fast' ? 5000 : 0))
const total = computed(() => subtotal.value - discount.value + shippingCharge.value)

/* ============ Helpers ============ */
const fmt = (n: number) =>
    new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT', maximumFractionDigits: 0 }).format(n)

const goNext = () => {
  if (tab.value === 'cart') {
    if (!items.value.length) return
    tab.value = 'billing'
  } else if (tab.value === 'billing') {
    if (!addresses.value.length) { openAddrDialog(); return }
    tab.value = 'payment'
  }
}
const goBack = () => (tab.value === 'payment' ? (tab.value = 'billing') : (tab.value = 'cart'))
function goProducts() { router.push('/') }

/* ============ Dummy QR (visual only) ============ */
const orderRef = ref('ORDER-' + new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14))
function qrDataUrl(label: string) {
  const size = 240, cell = 12, fg = '#111111', bg = '#ffffff'
  const finder = (x: number, y: number) =>
      `<rect x="${x}" y="${y}" width="${cell*3}" height="${cell*3}" fill="${fg}" />
     <rect x="${x+cell}" y="${y+cell}" width="${cell}" height="${cell}" fill="${bg}" />`
  let h = 0
  for (let i = 0; i < label.length; i++) { h = ((h << 5) - h) + label.charCodeAt(i); h |= 0 }
  const dots: string[] = []
  for (let r = 0; r < size / cell; r++) {
    for (let c = 0; c < size / cell; c++) {
      const inFinder = (r < 3 && c < 3) || (r < 3 && c > 16) || (r > 16 && c < 3)
      if (inFinder) continue
      h = (h * 1664525 + 1013904223) >>> 0
      if ((h & 7) < 3) dots.push(`<rect x="${c*cell}" y="${r*cell}" width="${cell}" height="${cell}" fill="${fg}"/>`)
    }
  }
  const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <rect width="100%" height="100%" fill="${bg}"/>
       ${finder(0,0)} ${finder(size-3*cell,0)} ${finder(0,size-3*cell)}
       ${dots.join('')}
     </svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

/* ============ Place Order (guest OK) ============ */
function placeOrder() {
  if (!items.value.length) return
  if (!addresses.value.length) { openAddrDialog(); return }
  // Send to backend here if you want; for now just log & go to thank you
  console.log('ORDER', {
    items: items.value,
    delivery: delivery.value,
    payMethod: payMethod.value,
    bank: payMethod.value === 'card' ? bank.value : undefined,
    shippingAddress: shippingAddress.value,
    billingAddress: billingAddress.value,
    totals: { subtotal: subtotal.value, discount: discount.value, shipping: shippingCharge.value, total: total.value },
  })
  router.push('/thank-you')
}
</script>

<template>
  <v-container fluid class="page-wrapper">
    <div class="maxWidth">
      <!-- ===== Stepper ===== -->
      <v-card class="rounded mb-6 pa-2" variant="flat">
        <v-tabs v-model="tab" align-tabs="start" color="primary">
          <v-tab :value="'cart'">
            <div class="pill" :class="{ active: tab === 'cart' }">
              <v-icon size="20" class="mr-2">mdi-basket-outline</v-icon>
              <div>
                <div class="text-none pill-title">Таны Сагс</div>
                <div class="text-none pill-sub">дахь Бүтээгдэхүүнүүд</div>
              </div>
            </div>
          </v-tab>
          <v-tab :value="'billing'">
            <div class="pill" :class="{ active: tab === 'billing' }">
              <v-icon size="20" class="mr-2">mdi-file-document-outline</v-icon>
              <div>
                <div class="text-none pill-title">Хүргэлтийн</div>
                <div class="text-none pill-sub">Мэдээлэл</div>
              </div>
            </div>
          </v-tab>
          <v-tab :value="'payment'">
            <div class="pill" :class="{ active: tab === 'payment' }">
              <v-icon size="20" class="mr-2">mdi-credit-card-outline</v-icon>
              <div>
                <div class="text-none pill-title">Төлбөр төлөх</div>
                <div class="text-none pill-sub">QR / Карт / COD</div>
              </div>
            </div>
          </v-tab>
        </v-tabs>
      </v-card>

      <v-window v-model="tab" class="z-auto">
        <!-- =================== CART =================== -->
        <v-window-item value="cart">
          <v-card variant="flat" class="rounded">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-h6">Таны Сагс ({{ items.length }})</div>
                <v-btn variant="text" class="text-none" color="primary" @click="goProducts">Бүтээгдэхүүн үзэх</v-btn>
              </div>

              <v-alert v-if="!items.length" type="info" variant="tonal" class="mb-4">
                Сагс хоосон байна. Бүтээгдэхүүнүүд рүү очиж нэмнэ үү.
              </v-alert>

              <v-divider class="my-4" :thickness="1" color="on-surface" style="opacity:.18" />

              <div v-for="it in items" :key="it.id" class="row-cart">
                <div class="cell product">
                  <v-avatar rounded size="64" class="mr-4">
                    <v-img :src="it.img" alt="" cover />
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1">{{ it.title }}</div>
                    <div class="text-caption muted">{{ it.subtitle }}</div>
                  </div>
                </div>

                <div class="cell price text-body-2">{{ fmt(it.price) }}</div>

                <div class="cell qty">
                  <v-btn icon size="small" variant="text" @click="dec(it.id)"><v-icon>mdi-minus</v-icon></v-btn>
                  <v-sheet rounded="lg" class="px-4 py-2 text-subtitle-2">{{ it.qty }}</v-sheet>
                  <v-btn icon size="small" variant="text" @click="inc(it.id)"><v-icon>mdi-plus</v-icon></v-btn>
                </div>

                <div class="cell total text-body-2">{{ fmt(it.price * it.qty) }}</div>

                <div class="cell action">
                  <v-btn icon variant="text" color="error" @click="removeItem(it.id)">
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </div>
              </div>

              <v-card class="summary-card mt-6 my-border" elevation="0">
                <v-card-text class="pa-6">
                  <div class="text-h6 mb-5">Захиалгын Мэдээлэл</div>
                  <div class="sum-row"><span>Үндсэн нийлбэр</span><span>{{ fmt(subtotal) }}</span></div>
                  <div class="sum-row"><span>Хөнгөлөлт 5%</span><span class="text-error">- {{ fmt(discount) }}</span></div>
                  <div class="sum-row"><span>Хүргэлтийн хураамж</span><span>–</span></div>
                  <v-divider class="my-3" />
                  <div class="sum-row total"><span>Нийт</span><span>{{ fmt(total) }}</span></div>
                </v-card-text>
              </v-card>

              <div class="d-flex justify-space-between mt-6">
                <v-btn class="text-none" variant="tonal" color="primary" @click="goProducts">Үргэлжлүүлэн үзэх</v-btn>
                <v-btn class="text-none" color="primary" :disabled="!items.length" @click="tab = 'billing'">Цааш</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- ================= BILLING ================= -->
        <v-window-item value="billing">
          <v-card variant="flat" class="rounded">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-h6">Хүргэлийн хаяг</div>
                <v-btn variant="outlined" color="primary" class="text-none" @click="openAddrDialog">
                  Хаяг оруулах
                </v-btn>
              </div>

              <v-alert v-if="!addresses.length" type="warning" variant="tonal" class="mb-4">
                Одоогоор хаяг бүртгэгдээгүй байна. <strong>“Хаяг оруулах”</strong> товчоор шинэ хаяг нэмнэ үү.
              </v-alert>

              <v-row v-else>
                <v-col v-for="a in addresses" :key="a.id" cols="12" md="4">
                  <v-card
                      class="rounded h-100"
                      :elevation="billingAddressId === a.id ? 4 : 0"
                      :variant="billingAddressId === a.id ? 'elevated' : 'tonal'"
                  >
                    <v-card-text class="pt-6">
                      <div class="d-flex align-center justify-space-between">
                        <div class="text-subtitle-1">
                          {{ a.name }} <span class="text-caption text-medium-emphasis">({{ a.tag }})</span>
                        </div>
                        <v-chip v-if="a.default" size="small" class="bg-primary" variant="flat">Үндсэн</v-chip>
                      </div>

                      <div class="text-body-2 mt-1">{{ a.line1 }}, {{ a.city }}</div>
                      <div class="d-flex align-center ga-2 mt-2">
                        <v-icon size="18">mdi-phone-outline</v-icon>
                        <span class="text-body-2">{{ a.phone }}</span>
                      </div>

                      <div class="d-flex align-center justify-space-between mt-6">
                        <v-btn
                            class="text-none text-primary" variant="outlined" size="small"
                            @click="billingAddressId = a.id; shippingAddressId = a.id"
                        >
                          Энэ хаягт хүргүүлэх
                        </v-btn>
                        <div class="d-flex">
                          <v-btn
                              icon variant="text"
                              @click="addresses = addresses.map(x => ({ ...x, default: x.id === a.id })); billingAddressId = a.id; shippingAddressId = a.id;"
                              :title="'Үндсэн болгох'"
                          >
                            <v-icon>mdi-star-outline</v-icon>
                          </v-btn>
                          <v-btn icon variant="text" color="error" @click="addresses = addresses.filter(x => x.id !== a.id)">
                            <v-icon>mdi-trash-can-outline</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-row class="mt-2">
                <v-col cols="12" md="7">
                  <v-card class="my-border" elevation="0">
                    <v-card-text>
                      <div class="text-subtitle-1 mb-3">Захиалгын мэдээлэл</div>
                      <div class="sum-row"><span>Үндсэн нийлбэр</span><span>{{ fmt(subtotal) }}</span></div>
                      <div class="sum-row"><span>Хөнгөлөлт 5%</span><span class="text-error">- {{ fmt(discount) }}</span></div>
                      <div class="sum-row"><span>Хүргэлтийн хураамж</span><span>–</span></div>
                      <v-divider class="my-2" />
                      <div class="sum-row strong"><span>Нийт</span><span>{{ fmt(total) }}</span></div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <div class="d-flex justify-space-between mt-6">
                <v-btn variant="tonal" color="primary" class="text-none" @click="goBack()">Буцах</v-btn>
                <v-btn
                    color="primary" size="large" class="text-none"
                    :disabled="!items.length || !addresses.length"
                    @click="tab = 'payment'"
                >
                  Цааш
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>

        <!-- ================= PAYMENT ================= -->
        <v-window-item value="payment">
          <v-card variant="flat" class="rounded">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <!-- Delivery Options -->
                  <div class="text-subtitle-1 mb-3">Хүргэлтийн төрөл</div>
                  <v-radio-group v-model="delivery">
                    <v-sheet class="card-radio mb-3 my-border" rounded="xl" border>
                      <v-radio :value="'standard'" class="mr-3" />
                      <div class="flex-1">
                        <div class="text-subtitle-2">Энгийн хүргэлт (Үнэгүй)</div>
                        <div class="text-caption muted">1–2 хоногт</div>
                      </div>
                    </v-sheet>

                    <v-sheet class="card-radio mb-6 my-border" rounded="xl" border>
                      <v-radio :value="'fast'" class="mr-3" />
                      <div class="flex-1">
                        <div class="text-subtitle-2">Шуурхай хүргэлт ({{ fmt(5000) }})</div>
                        <div class="text-caption muted">1–2 цагт</div>
                      </div>
                    </v-sheet>
                  </v-radio-group>

                  <!-- Payment Options -->
                  <div class="text-subtitle-1 mb-3">Төлбөр хийх боломж</div>
                  <v-radio-group v-model="payMethod">
                    <!-- QR -->
                    <v-sheet class="card-radio mb-3 my-border" rounded="xl" border>
                      <v-radio :value="'qr'" class="mr-3" />
                      <div class="flex-1">
                        <div class="text-subtitle-2 d-flex align-center justify-space-between">
                          <span>QR кодоор (QPay-тэй адил харагдах)</span>
                          <v-icon size="24">mdi-qrcode</v-icon>
                        </div>
                        <div class="text-caption muted">Доорх QR-г уншуулж шилжүүлэг хийнэ.</div>

                        <div v-if="payMethod === 'qr'" class="d-flex flex-column align-center mt-4">
                          <v-img :src="qrDataUrl(orderRef)" width="220" height="220" class="mb-3" />
                          <div class="text-body-2 text-center">
                            Данс: <strong>Matcha LLC</strong><br>
                            Гүйлгээний утга: <strong>{{ orderRef }}</strong><br>
                            Дүн: <strong>{{ fmt(total) }}</strong>
                          </div>
                        </div>
                      </div>
                    </v-sheet>

                    <!-- Card -->
                    <v-sheet class="card-radio mb-3 my-border" rounded="xl" border>
                      <v-radio :value="'card'" class="mr-3" />
                      <div class="flex-1">
                        <div class="text-subtitle-2">Банкны карт</div>
                        <div class="text-caption muted mb-3">Дотоодын банкууд.</div>

                        <div v-if="payMethod === 'card'">
                          <div class="d-flex ga-3 mb-3">
                            <v-btn
                                v-for="b in (['khaan','golomt','mbank'] as const)"
                                :key="b" variant="tonal" class="bank-btn"
                                :color="bank === b ? 'primary' : undefined"
                                @click="bank = b"
                            >
                              <v-avatar size="24" class="mr-2">
                                <v-img :src="bankLogoUrl(b)" />
                              </v-avatar>
                              <span class="text-body-2">
                                {{ b === 'khaan' ? 'Хаан Банк'
                                  : b === 'golomt' ? 'Голомт Банк' : 'М Банк' }}
                              </span>
                            </v-btn>
                          </div>

                        </div>
                      </div>
                    </v-sheet>

                    <!-- COD -->
                    <v-sheet class="card-radio my-border" rounded="xl" border>
                      <v-radio :value="'cod'" class="mr-3" />
                      <div>
                        <div class="text-subtitle-2">Хүргэлтийн ажилтанд төлөх (COD)</div>
                        <div class="text-caption muted">Хүргэлтийн үед бэлнээр төлөх</div>
                      </div>
                    </v-sheet>
                  </v-radio-group>

                  <div class="d-flex mt-6">
                    <v-btn variant="tonal" color="primary" class="text-none" @click="goBack()">Буцах</v-btn>
                  </div>
                </v-col>

                <!-- Right sticky column -->
                <v-col cols="12" md="4">
                  <div class="sticky">
                    <!-- Mini cart -->
                    <v-card class="my-border elevation-1 mb-4">
                      <v-card-text>
                        <div class="text-subtitle-1 mb-2 text-none">Таны сагс</div>
                        <div v-for="it in items" :key="'mini-' + it.id" class="mini">
                          <v-avatar size="40" rounded class="mr-3">
                            <v-img :src="it.img" cover />
                          </v-avatar>
                          <div class="flex-1">
                            <div class="text-body-2">{{ it.title }}</div>
                            <div class="text-caption muted">{{ fmt(it.price) }}</div>
                          </div>
                        </div>
                        <div v-if="!items.length" class="text-body-2 text-medium-emphasis py-4">
                          Сагс хоосон байна.
                        </div>
                      </v-card-text>
                    </v-card>

                    <!-- Order summary -->
                    <v-card class="my-border elevation-1 mb-4">
                      <v-card-text>
                        <div class="text-subtitle-1 mb-2">Захиалгын мэдээлэл</div>
                        <div class="sum-row"><span>Үндсэн нийлбэр</span><span>{{ fmt(subtotal) }}</span></div>
                        <div class="sum-row"><span>Хөнгөлөлт 5%</span><span class="text-error">- {{ fmt(discount) }}</span></div>
                        <div class="sum-row"><span>Хүргэлтийн хураамж</span><span>{{ fmt(shippingCharge) }}</span></div>
                        <v-divider class="my-2" />
                        <div class="sum-row strong"><span>Нийт үнийн дүн</span><span>{{ fmt(total) }}</span></div>
                      </v-card-text>
                    </v-card>

                    <!-- Address card (only if exists) -->
                    <v-card v-if="shippingAddress" class="my-border elevation-1 mb-4">
                      <v-card-text>
                        <div class="text-subtitle-1 mb-2">
                          {{ shippingAddress.name }}
                          <span class="text-caption text-medium-emphasis">({{ shippingAddress.tag }})</span>
                        </div>
                        <div class="text-body-2">{{ shippingAddress.line1 }}, {{ shippingAddress.city }}</div>
                        <div class="d-flex align-center ga-2 mt-2">
                          <v-icon size="18">mdi-phone-outline</v-icon>
                          <span class="text-body-2">{{ shippingAddress.phone }}</span>
                        </div>
                      </v-card-text>
                    </v-card>

                    <v-btn
                        block color="primary" size="large" class="text-none"
                        :disabled="!items.length || !addresses.length"
                        @click="placeOrder"
                    >
                      Захиалга өгөх
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </div>

    <!-- ===== Address Dialog ===== -->
    <v-dialog v-model="addrDialog" max-width="560">
      <v-card>
        <v-card-title class="text-subtitle-1">Хаяг оруулах</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="addrForm.name" label="Хүлээн авагчийн нэр" required hide-details />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                  v-model="addrForm.tag"
                  :items="[{title:'Гэр', value:'Гэр'}, {title:'Ажлын газар', value:'Ажлын газар'}]"
                  label="Төрөл"
                  hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="addrForm.phone" label="Утас" required hide-details />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="addrForm.city" label="Хот/Аймаг" required hide-details />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="addrForm.line1" label="Дэлгэрэнгүй хаяг" required hide-details />
            </v-col>
            <v-col cols="12">
              <v-checkbox v-model="addrForm.makeDefault" label="Үндсэн хаяг болгох" density="compact" hide-details />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" class="text-none" @click="addrDialog=false">Болих</v-btn>
          <v-btn color="primary" class="text-none" @click="saveAddress">Хадгалах</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
/* ---------- Stepper pills ---------- */
.pill { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:4px;
  border:1px solid var(--v-border-color); background:var(--v-theme-surface); transition:.2s ease; }
.pill-title { font-size: .88rem; line-height:1.1; }
.pill-sub { font-size:.74rem; opacity:.65; margin-top:2px; }

/* ---------- Cart table-like rows ---------- */
.row-cart { display:grid; gap:16px; grid-template-columns:minmax(240px,1.2fr) 120px 160px 100px 56px;
  align-items:center; padding:16px 8px; border-bottom:1px solid rgba(var(--v-theme-on-surface),.09); }
.row-cart:last-child { border-bottom:none; }
.cell.product { display:flex; align-items:center; }
.cell.qty { display:flex; align-items:center; gap:6px; }
.muted { opacity:.7; }

/* ---------- Summary rows ---------- */
.sum-row { display:flex; justify-content:space-between; padding:6px 0; }
.sum-row.strong span:first-child { font-weight:600; }
.sum-row.total span:first-child { font-weight:700; }

/* ---------- Card radios ---------- */
.card-radio { display:flex; align-items:flex-start; gap:12px; padding:14px; background:var(--v-theme-surface); }
.card-radio:hover { box-shadow:0 4px 16px rgba(0,0,0,.06); }

/* ---------- Right sticky column ---------- */
.sticky { position:sticky; top:84px; }
.mini { display:flex; align-items:center; padding:8px 0; }

/* ---------- Borders ---------- */
.my-border{ border:1px solid rgba(var(--v-theme-on-surface), .09); border-radius:7px; }

/* ---------- Bank selection ---------- */
.bank-btn { text-transform:none; }
@media (max-width: 960px) {
  .row-cart { grid-template-columns:1fr; align-items:start; }
}
</style>
