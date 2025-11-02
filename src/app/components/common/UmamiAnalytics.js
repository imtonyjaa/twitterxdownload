'use client'

import Script from 'next/script'

export default function UmamiAnalytics() {
    if(!process.env.NEXT_PUBLIC_UMAMI) return '';

    const umami_settings = process.env.NEXT_PUBLIC_UMAMI.split('|');
    return (
        <Script defer src={umami_settings[0]} data-website-id={umami_settings[1]} />
    )
}
