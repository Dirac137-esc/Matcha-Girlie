import type { ThemeTypes } from '@/types/themeTypes/ThemeType'

const LightTheme: ThemeTypes = {
    name: 'MatchaLight',
    dark: false,
    variables: {
        'border-color': '#E3EAE4',
        'carousel-control-size': 10,
    },
    colors: {
        // Brand
        primary:   '#2F7B54', // deep matcha
        secondary: '#8FD19E', // mint accent
        info:      '#6CB9A8', // tea-water teal
        success:   '#2CB67D', // fresh herb
        accent:    '#E4CDA7', // toasted sesame / cream
        warning:   '#E8B24C', // yuzu gold
        error:     '#E46C5A', // clay red
        muted:     '#5C6F64', // sage gray

        // Tinted backgrounds
        lightprimary:   '#EAF6EF',
        lightsecondary: '#ECF8F0',
        lightsuccess:   '#EAFBF4',
        lighterror:     '#FCEDEA',
        lightwarning:   '#FFF6E5',

        // Text & chrome
        textPrimary:   '#24322B', // evergreen
        textSecondary: '#5C6F64', // sage
        borderColor:   '#E3EAE4',
        inputBorder:   '#D6E2DA',
        lightlight:    '#E8F2EC', // soft matcha mist

        // Surfaces
        background:  '#FFFFFF', // warm off-white with a hint of green
        containerBg: '#FFFFFF',
        surface:     '#FFFFFF',
        hoverColor:  '#F3F7F3',
        'on-surface-variant': '#EEF4EF',

        // Extras
        grey100: '#F3F7F3',
        grey200: '#E7EEE9',
        rating:  '#FFB22B', // star color
    },
}

export { LightTheme }
