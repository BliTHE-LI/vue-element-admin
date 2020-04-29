<template>
<el-container class="home-container">
  <!-- 页面头部区域 -->
  <el-header>
    <div>
      <img src="../assets/logo.png" alt="" style="height: 40px">
      <span>后台管理系统</span>
    </div>
    <div>
      <el-button type="info" @click="logout">退出登录</el-button>
    </div>
  </el-header>
  <!-- 页面主体区域 -->
  <el-container>
    <!-- 左侧菜单区域 -->
    <el-aside :width="isCollapse? '64px' : '200px'">
      <div class="toggle-button" @click="toggleCollapse">|||</div>
      <!-- 侧边栏菜单区域 -->
      <el-menu
        :collapse="isCollapse"
        :collapse-transition="false"
        :router="true"
        :default-active="defaultActive"
        unique-opened
        background-color="#333744"
        text-color="#fff"
        active-text-color="#409eff">
        <!-- 一级菜单 -->
        <el-submenu v-for="item in menuList" :key="item.id" :index="item.id + ''">
          <!-- 一级菜单模板区域 -->
          <template slot="title">
            <!-- 菜单图标 -->
            <i :class="menuIcon[item.id]"></i>
            <!-- 菜单文本 -->
            <span>{{item.authName}}</span>
          </template>
          <!-- 二级菜单 -->
          <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/' + subItem.path">
            <template slot="title">
              <!-- 菜单图标 -->
              <i class="el-icon-menu"></i>
              <!-- 菜单文本 -->
              <span>{{subItem.authName}}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!--  -->
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      // 菜单数据
      menuList: [],
      menuIcon: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-check',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      },
      // 是否折叠菜单
      isCollapse: false,
      // 默认选中的菜单
      defaultActive: ''
    }
  },
  created () {
    this.getMenuList()
    // 下面两个方法都能实现刷新默认选择菜单功能
    // this.defaultActive = location.pathname
    this.defaultActive = this.$router.history.current.path
  },
  methods: {
    logout () {
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
    },
    // 获取菜单
    async getMenuList () {
      const { data: result } = await this.$http.get('menus')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.menuList = result.data
    },
    // 切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }
}
</script>

<style lang="stylus" scoped>
  .home-container
    min-height 100%
    .el-header
      background-color #373d41
      display flex
      justify-content space-between
      align-items center
      color #ffffff
      font-size 20px
      div
        display flex
        align-items center
        span
          margin-left 15px
    .el-aside
      background-color #333744
      .toggle-button
        background-color #4a5064
        font-size 10px
        line-height 20px
        color #ffffff
        text-align center
        letter-spacing 0.2em
        cursor pointer
      .el-menu
        border-right none
    .el-main
      background-color #eaedf1
</style>
