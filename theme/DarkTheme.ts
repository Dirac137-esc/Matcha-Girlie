import type { ThemeTypes } from '@/types/themeTypes/ThemeType'

const DarkTheme: ThemeTypes = {
    name: 'DarkTheme',
    dark: true,
    variables: {
        'border-color': '#243347',
        'carousel-control-size': 10,
    },
    colors: {
        // Brand (same hues as light so accents pop on dark)
        primary:   '#2e7293',
        secondary: '#49BEFF',
        info:      '#539BFF',
        success:   '#13DEB9',
        accent:    '#FFAB91',
        warning:   '#FFAE1F',
        error:     '#FA896B',
        muted:     '#A5B3C6',


        textPrimary:   '#7e8eab',
        textSecondary: '#B8C3D9',

        // Surfaces (deep navy > slate stack exactly like the screenshot)
        background:  '#222936', // page canvas
        containerBg: '#0E1726', // app shell / drawer
        surface:     '#222936', // cards/sheets
        hoverColor:  '#1F2A3A', // hovers
        'on-surface-variant': '#223045', // subtle outlines/pressed

        // Inputs & borders
        borderColor: '#243347',
        inputBorder: '#314155',

        // Subtle fills
        grey100: '#1A2433',
        grey200: '#263449',

        // Extra
        lightprimary:   '#172641',
        lightsecondary: '#15324A',
        lightsuccess:   '#113A33',
        lighterror:     '#3B2324',
        lightwarning:   '#3B2E13',
        rating:         '#FFB22B',
    },
}

export { DarkTheme }
