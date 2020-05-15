import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 按需导入Element-UI
import './plugins/element.js'

// 导入全局样式
import './assets/css/global.stylus' // 注册

// 导入 NProgress 对应的 JS 和 CSS
// import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'
Vue.config.productionTip = false

axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // 在 request 拦截其中，展示进度条
  // NProgress.start()
  // 请求头中添加token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(response => {
  // 在 response 拦截其中，隐藏进度条
  // NProgress.done()
  console.log(response)
  return response
})
Vue.prototype.$http = axios

// 导入树形表格组件
Vue.component('tree-table', TreeTable)

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 定义全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const yyyy = dt.getFullYear()
  const MM = `${dt.getMonth() + 1}`.padStart(2, '0')
  const dd = `${dt.getDate()}`.padStart(2, '0')
  const HH = `${dt.getHours()}`.padStart(2, '0')
  const mm = `${dt.getMinutes()}`.padStart(2, '0')
  const ss = `${dt.getSeconds()}`.padStart(2, '0')
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
