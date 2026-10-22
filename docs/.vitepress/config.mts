import { defineConfig } from 'vitepress'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

/**
 * 站点的部署子路径（Vite 的 `base`）。它只在**构建期**生效，会被写进产物的
 * 每一个资源 URL 与路由里，所以一份 `dist` 只能服务一个 URL 前缀。
 *
 * 本站同时部署到两个地方，而两者的路径并不相同：
 *
 * 因此这里不写死，改由构建环境用 `DOCS_BASE` 注入（CI 里各自设置），
 * 本地 `docs:dev` 或未设置时回落到根路径 '/'。
 */
function resolveBase(): string {
  const raw = (process.env.DOCS_BASE ?? '').trim()
  if (!raw || raw === '/') return '/'
  return `/${raw.replace(/^\/+|\/+$/g, '')}/`
}

/**
 * GitHub 风格告警（`> [!IMPORTANT]` 等）在 VitePress 1.x 里标题写死为英文，
 * 官方没有提供 `importantLabel` 之类的配置项，这里用一个 markdown-it 规则补上中文。
 */
const alertLabels: Record<string, string> = {
  note: '注意',
  info: '信息',
  tip: '提示',
  important: '重要',
  warning: '警告',
  caution: '小心',
  danger: '危险'
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  // 具体值由构建环境通过 DOCS_BASE 传入，见上方 resolveBase()。
  base: resolveBase(),
  title: 'Motori',
  description: 'Motori',

  // 文档里指向 Motori 本机服务的链接（http://localhost:5270/）不是站点页面，
  // 不需要当作死链处理。
  ignoreDeadLinks: 'localhostLinks',

  markdown: {
    // 代码块「复制」按钮的 tooltip。
    codeCopyButtonTitle: '复制代码',
    // `::: tip` 之类自定义容器的默认标题。
    container: {
      tipLabel: '提示',
      infoLabel: '信息',
      warningLabel: '警告',
      dangerLabel: '危险',
      detailsLabel: '详细信息',
      importantLabel: '重要',
      cautionLabel: '小心',
      noteLabel: '注意'
    },
    config(md) {
      md.core.ruler.push('zh-alert-titles', (state) => {
        for (const token of state.tokens) {
          const meta = token.meta
          if (token.type !== 'github_alert_open' || !meta) continue
          // 作者手写了标题（`> [!NOTE] 自定义标题`）时保留原文。
          if (meta.title === String(meta.type).toUpperCase()) {
            meta.title = alertLabels[meta.type] ?? meta.title
          }
        }
      })
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '指南', link: '/briefing' }
    ],

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '简介', link: '/briefing' },
          { text: '快速开始', link: '/getting-started' },
          {
            text: 'Live2D',
            base: '/live2d/',
            collapsed: false,
            items: [
              {
                text: '自定义动作与表情',
                base: '/live2d/custom-motions-expressions/',
                collapsed: false,
                items: [
                  { text: '快速开始', link: '.' }
                ]
              }
            ]
          },
          {
            text: '引擎使用范式',
            base: '/engines/',
            collapsed: false,
            items: [
              { text: 'WebGAL', link: 'webgal' },
              { text: "Ren'Py", link: 'renpy' },
            ]
          }
        ]
      }
    ],

    // 右侧目录的标题与层级：
    //   level: 2            → 只收 H2（默认）
    //   level: [2, 3]       → 收 H2、H3，H3 嵌套在 H2 下
    //   level: [2, 4]       → 收 H2~H4
    //   level: 'deep'       → 等价于 [2, 6]，收 H2~H6
    //   outline: false      → 整个目录不渲染
    outline: { level: [2, 4], label: '页面导航' },

    // 文档底部的上一页 / 下一页。
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    // 标题栏与无障碍文案。
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    skipToContentLabel: '跳到主要内容',

    // 启用「最后更新时间」时显示的文案。
    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short', forceLocale: true }
    },

    // 404 页面文案。
    notFound: {
      title: '页面不存在',
      quote: '这里什么也没有，也许链接已经失效了。',
      linkLabel: '返回首页',
      linkText: '返回首页'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },

  vite: {
    plugins: [
      // 让 Markdown 里可以直接写 <i-mdi-xxx /> 引用 Material Design Icons。
      // 组件名规则：i-<集合>-<图标名>，例如 i-mdi-alert、i-mdi-github。
      Components({
        // 也扫描 .md，这样在文章正文里写标签即可。
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          IconsResolver({
            // 只启用 mdi 集合（@iconify-json/mdi）。
            enabledCollections: ['mdi']
          })
        ],
        // 不生成 components.d.ts，避免往项目里塞类型文件。
        dts: false
      }),
      Icons({
        // 生成 Vue 3 组件；图标默认跟随字号与文字颜色。
        compiler: 'vue3',
        // 略微放大，使其在中文正文里视觉大小更协调。
        scale: 1.1,
        // 注意：不要用 `vp-icon`。VitePress 默认主题自带一条
        //   .vp-icon:not(.bg) { mask: var(--icon) no-repeat; background-color: currentColor; }
        // 的规则，会给这个类套上 mask，把图标变成实心方块。
        defaultClass: 'md-icon',
        // 与文字基线对齐，避免图标在正文/表格里偏上。
        defaultStyle: 'display:inline-block;vertical-align:-0.125em;',
        autoInstall: false
      })
    ]
  }
})
