import Vue from 'vue'
import VueRouter from 'vue-router'
// 引入nprogress
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' // 这个样式必须引入

Vue.use(VueRouter)
// const constantRouterComponents = {
//   home: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
//   welcome: () => import(/* webpackChunkName: "welcome" */ '../views/Welcome.vue'),
//   login: () => import(/* webpackChunkName: "user-login" */ '../views/user/Login.vue'),
//   users: () => import(/* webpackChunkName: "user-users" */ '../views/user/Users.vue'),
//   rights: () => import(/* webpackChunkName: "power-rights" */ '../views/power/Rights.vue'),
//   roles: () => import(/* webpackChunkName: "power-roles" */ '../views/power/Roles.vue'),
//   categories: () => import(/* webpackChunkName: "goods-categories" */ '../views/goods/Cate.vue'),
//   params: () => import(/* webpackChunkName: "goods-params" */ '../views/goods/Params.vue')
// }

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    name: '登录',
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '../views/user/Login.vue')
  },
  {
    name: '首页',
    path: '/home',
    component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    redirect: '/welcome',
    children: [
      {
        name: '首页',
        path: '/welcome',
        // 动态引入的页面组件
        component: () => import(/* webpackChunkName: "welcome" */ '../views/Welcome.vue')
      },
      {
        name: '用户列表',
        path: '/users',
        component: () => import(/* webpackChunkName: "users" */ '../views/user/Users.vue')
      },
      {
        name: '权限列表',
        path: '/rights',
        component: () => import(/* webpackChunkName: "rights" */ '../views/power/Rights.vue')
      },
      {
        name: '角色列表',
        path: '/roles',
        component: () => import(/* webpackChunkName: "roles" */ '../views/power/Roles.vue')
      },
      {
        name: '商品分类',
        path: '/categories',
        component: () => import(/* webpackChunkName: "goods_categories" */ '../views/goods/Cate.vue')
      },
      {
        name: '分类参数',
        path: '/params',
        component: () => import(/* webpackChunkName: "goods_params" */ '../views/goods/Params.vue')
      },
      {
        name: '商品列表',
        path: '/goods',
        component: () => import(/* webpackChunkName: "goods_list" */ '../views/goods/List.vue')
      },
      {
        name: '添加商品',
        path: '/goods/add',
        component: () => import(/* webpackChunkName: "goods_add" */ '../views/goods/Add.vue')
      },
      {
        name: '订单列表',
        path: '/orders',
        component: () => import(/* webpackChunkName: "orders" */ '../views/order/Order.vue')
      },
      {
        name: '数据报表',
        path: '/reports',
        component: () => import(/* webpackChunkName: "reports" */ '../views/report/Report.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})
// 简单配置
NProgress.inc(0.2)
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })
router.beforeEach((to, from, next) => {
  // 在 axios 的 request 拦截器中添加了，此处不需要添加
  NProgress.start()
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

router.afterEach(() => {
  // 在 axios 的 response 拦截器中添加了，此处不需要添加
  NProgress.done()
})

export default router
