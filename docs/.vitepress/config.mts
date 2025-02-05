import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Cooker",
  description: "The best front-end local mocking tool ever!",
  themeConfig: {
    logo: '/logo.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Introduce', link: '/introduce' }
    ],

    sidebar: [
      { text: 'Introduction to Cooker', link: '/introduce' },
      { text: 'FAQ', link: '/faq' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cooker-mock' }
    ]
  }
})
