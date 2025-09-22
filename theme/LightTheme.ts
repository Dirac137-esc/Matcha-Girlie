import type { ThemeTypes } from '@/types/themeTypes/ThemeType'

const LightTheme: ThemeTypes = {
    name: 'LightTheme',
    dark: false,
    variables: {
        'border-color': '#E5EAEF',
        'carousel-control-size': 10,
    },
    colors: {
        // Brand (matches the light screenshot)
        primary:   '#237195',
        secondary: '#49BEFF',
        info:      '#539BFF',
        success:   '#13DEB9',
        accent:    '#FFAB91',
        warning:   '#FFAE1F',
        error:     '#FA896B',
        muted:     '#5A6A85',

        // Tinted backgrounds for chips/badges/etc.
        lightprimary:   '#ECF2FF',
        lightsecondary: '#E8F7FF',
        lightsuccess:   '#E6FFFA',
        lighterror:     '#FDEDE8',
        lightwarning:   '#FEF5E5',

        // Text & chrome
        textPrimary:   '#2A3547',
        textSecondary: '#5A6A85',
        borderColor:   '#E5EAEF',
        inputBorder:   '#D7DEE6',
       lightlight:   'rgb(217,231,237)',
        // Surfaces (white cards on very light canvas)
        background:  '#FFFFFF',  // page canvas (very light blue-grey from screenshot)
        containerBg: '#FFFFFF',   // app shell
        surface:     '#FFFFFF',   // cards/sheets
        hoverColor:  '#F6F9FC',
        'on-surface-variant': '#EEF2F6', // subtle dividers / pressed

        // Extras used across the template
        grey100: '#F6F9FC',
        grey200: '#EEF2F6',
        rating:  '#FFB22B', // star color seen in cards
    },
}

export { LightTheme }
