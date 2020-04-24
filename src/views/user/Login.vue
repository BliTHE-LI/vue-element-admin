<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="../../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login-form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" clearable></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="请输入密码" show-password clearable></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="form-btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="restLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      // 登录表单数据
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单验证规则
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置登录表单数据
    restLoginForm () {
      // 通过ref获取到表单引用对象
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return false
        const { data: result } = await this.$http.post('login', this.loginForm)
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '登录失败')
        }
        this.$message.success('登录成功')
        // 登录成功后续操作：
        // 1. 登录成功后将服务端返回的 token 保存到客户端的 sessionStorage 中
        //    1.1 项目中除了登录之外的其它API接口都必须在登录之后才能访问
        //    1.2 token 只应该在网站打开期间生效，所以讲 token 保存在 sessionStorage 中
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        console.log(result)
        window.sessionStorage.setItem('token', result.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.login-container
  background-color #2b4b6b
  height 100%
  .login-box
    width 450px
    height 300px
    background-color #ffffff
    border-radius 3px
    position absolute
    left 50%
    top 50%
    transform translate(-50%, -50%)
    .avatar-box
      height 130px
      width 130px
      border 1px solid #eeeeee
      border-radius 50%
      padding 10px
      box-shadow 0 0 10px #dddddd
      position absolute
      left 50%
      transform translate(-50%, -50%)
      background-color #ffffff
      img
        width 100%
        height 100%
        border-radius 50%
        background-color #eeeeee
    .login-form
      position absolute
      bottom 0
      width 100%
      padding 0 10px
      box-sizing border-box
      .form-btns
        display flex
        justify-content flex-end
</style>
