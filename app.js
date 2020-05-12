
const path = require('path')
const express = require('express')
const history = require('connect-history-api-fallback')
const compression = require('compression')
const app = express()
// 开启gzip压缩
// compression 必须在静态资源之前引入，否则gzip不会生效
app.use(compression())
// 必须在静态资源之前引入，否则刷新浏览器会出现404
app.use(history())
// 声明静态资源文件夹
app.use(express.static(path.join(__dirname, 'dist')))
// 监听端口，开启服务
app.listen(8080, () => {
  console.log('server running at http://127.0.0.1: 8080')
})
