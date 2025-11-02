// app/providers.js
'use client'

import {HeroUIProvider,ToastProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";

export function Providers({children}) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
      <ToastProvider placement="top-center" toastOffset={230} />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  )
}