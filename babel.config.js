// 生产模式需要用到的 babel 插件
const prodPlugins = []
// 判断是不是生产模式
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push([
    'transform-remove-console',
    {
      exclude: ['error', 'warn']
    }
  ])
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 生产模式需要用到的插件数组
    ...prodPlugins
  ]
}
