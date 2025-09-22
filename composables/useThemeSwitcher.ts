import { useNuxtApp } from '#app'
import { computed } from 'vue'

export function useThemeSwitcher() {
    const { $theme } = useNuxtApp() as unknown as {
        $theme: {
            toggleTheme: () => void
            setTheme: (name: 'LightTheme' | 'DarkTheme') => void
            current: Ref<string>
        }
    }

    const isDark = computed(() => $theme.current.value === 'DarkTheme')
    const label = computed(() => (isDark.value ? 'Switch to Light' : 'Switch to Dark'))

    return {
        isDark,
        label,
        toggle: $theme.toggleTheme,
        set: $theme.setTheme,
        current: $theme.current,
    }
}
