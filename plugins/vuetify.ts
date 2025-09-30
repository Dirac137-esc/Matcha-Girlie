import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vue3-perfect-scrollbar/style.css'
import '@/scss/style.scss'

import { LightTheme } from '@/theme/LightTheme'
import { DarkTheme } from '@/theme/DarkTheme'

type ThemeName = 'LightTheme' | 'DarkTheme'

function getInitialTheme(): ThemeName {
    return 'LightTheme'
}

export default defineNuxtPlugin((nuxtApp) => {
    const initial = getInitialTheme()

    const vuetify = createVuetify({
        components,
        directives,
        theme: {
            defaultTheme: initial,
            themes: {
                LightTheme,
                DarkTheme,
            },
        },
    })

    nuxtApp.vueApp.use(vuetify)

    // helpers
    const setHtmlAttr = (name: ThemeName) => {
        if (!process.client) return
        document.documentElement.setAttribute('data-theme', name)
    }
    setHtmlAttr(initial)

    const setTheme = (name: ThemeName) => {
        vuetify.theme.global.name.value = name
        setHtmlAttr(name)
        if (process.client) localStorage.setItem('theme', name)
    }

    const toggleTheme = () => {
        const current = vuetify.theme.global.name.value as ThemeName
        setTheme(current === 'LightTheme' ? 'DarkTheme' : 'LightTheme')
    }

    // expose to app
    nuxtApp.provide('theme', {
        setTheme,
        toggleTheme,
        current: vuetify.theme.global.name, // Ref<string>
    })
})
