// app/routes/__root.tsx
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Music Mini Games - Learn Music Through Fun Mini-Games',
      },
      {
        name: 'description',
        content: 'Learn music through interactive mini-games with real-time audio processing. Train your ear and master music skills. Daily challenges, streak tracking, and more. Free on iPhone & iPad.',
      },
      // Open Graph / Facebook
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Music Mini Games - Interactive Music Learning',
      },
      {
        property: 'og:description',
        content: 'Multiple music mini-games with real-time audio processing! Learn chord singing, train your ear, and build daily streaks. Game Center leaderboards and more.',
      },
      {
        property: 'og:image',
        content: 'https://musicminigames.com/app-icon.png',
      },
      // Twitter
      {
        property: 'twitter:card',
        content: 'summary',
      },
      {
        property: 'twitter:title',
        content: 'Music Mini Games - Interactive Music Learning',
      },
      {
        property: 'twitter:description',
        content: 'Multiple music mini-games with real-time audio processing! Learn chord singing, train your ear, and build daily streaks. Game Center leaderboards and more.',
      },
      {
        property: 'twitter:image',
        content: 'https://musicminigames.com/app-icon.png',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/app-icon.png',
      },
    ],
    scripts: [
      // MailerLite Universal
      {
        type: 'text/javascript',
        children: `
          (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
          .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
          n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
          (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
          ml('account', '1873258');
        `,
      },
      // Google Analytics
      {
        type: 'text/javascript',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-J2LJ92P4MP',
        async: true,
      },
      {
        type: 'text/javascript',
        children: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-J2LJ92P4MP');
        `,
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}