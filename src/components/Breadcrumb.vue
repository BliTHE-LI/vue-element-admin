<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item v-for="item in breadList" :key="item.path">{{item.name}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'breadcrumb',
  data () {
    return {
      breadList: [] // 路由集合
    }
  },
  created () {
    this.getBreadcrumb()
  },
  watch: {
    $route () {
      this.getBreadcrumb()
    }
  },
  methods: {
    isHome (route) {
      return route.name === 'home'
    },
    getBreadcrumb () {
      const matched = this.$route.matched
      // 如果不是首页
      // if (!this.isHome(matched[0])) {
      //   matched = [{ path: '/home', meta: { title: '首页' } }].concat(matched)
      // }
      this.breadList = matched
    }
  }
}
</script>

<style lang="stylus" scoped>

</style>
