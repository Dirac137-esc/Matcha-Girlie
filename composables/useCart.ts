// src/composables/useCart.ts
import { ref, computed, watch } from 'vue'

export type CartItem = {
    id: string
    title: string
    subtitle?: string
    price: number
    qty: number
    img: string
}

const STORAGE_KEY = 'matcha_cart_v1'

// singletons (shared across app)
const items = ref<CartItem[]>(load())
const drawer = ref(false)

function load(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
}

watch(items, save, { deep: true })

const count = computed(() => items.value.reduce((s, i) => s + i.qty, 0))
const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.qty, 0))

function add(payload: Omit<CartItem, 'qty'>, qty = 1) {
    const idx = items.value.findIndex(i => i.id === payload.id)
    if (idx >= 0) items.value[idx].qty = Math.min(99, items.value[idx].qty + qty)
    else items.value.unshift({ ...payload, qty })
}
function inc(id: string) {
    const it = items.value.find(i => i.id === id); if (it) it.qty = Math.min(99, it.qty + 1)
}
function dec(id: string) {
    const it = items.value.find(i => i.id === id); if (it) it.qty = Math.max(1, it.qty - 1)
}
function removeItem(id: string) {
    items.value = items.value.filter(i => i.id !== id)
}
function clear() { items.value = [] }

export function useCart() {
    return {
        // state
        items, count, subtotal, drawer,
        // actions
        add, inc, dec, removeItem, clear,
        openDrawer: () => (drawer.value = true),
        closeDrawer: () => (drawer.value = false),
        toggleDrawer: () => (drawer.value = !drawer.value),
    }
}
