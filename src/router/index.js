import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/user/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    // 动态引入的页面组件
    component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  // to => 将要访问的路径
  // from => 从哪个路径跳转而来
  // next => 一个函数，控制是否继续执行
  // 不是登录才校验登录
  if (to.path !== '/login') {
    const token = window.sessionStorage.getItem('token')
    // 没有登录强制跳转到登录
    if (!token) return next('/login')
  }
  next()
})

export default router
