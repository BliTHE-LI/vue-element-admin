import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Icon,
  Message
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Icon)
// 全局挂载message方法
Vue.prototype.$message = Message
