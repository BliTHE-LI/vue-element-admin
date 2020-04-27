<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="() => {queryInfo.pagenum=1;getUserList()}">
            <el-button slot="append" icon="el-icon-search" @click="() => {queryInfo.pagenum=1;getUserList()}"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip placement="top" :enterable="false" content="编辑">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip placement="top" :enterable="false" content="删除">
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip placement="top" :enterable="false" content="分配角色">
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :total="total"
        :page-sizes="[1, 2, 5, 10]"
        background
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="addDialogVisible"
      @close="addDialogClosed"
      title="添加用户"
      width="50%">
      <!-- 主体区域 -->
      <el-form
        :model="addUserForm"
        :rules="addUserFormRules"
        ref="addUserFormRef"
        label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addUserForm.password" clearable show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile" clearable></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      :close-on-click-modal="false"
      :visible.sync="editDialogVisible"
      @close="editDialogClosed"
      title="修改用户信息"
      width="50%">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      :visible.sync="setRoleDialogVisible"
      @close="setRoleDialogClosed"
      title="分配角色"
      width="50%">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId">
            <el-option
              v-for="role in rolesList"
              :key="role.id"
              :label="role.roleName"
              :value="role.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'users',
  data () {
    // 校验邮箱规则
    const checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    const checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 用户信息
      userList: [],
      // 数据总条数
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单验证规则
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名长度在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑时，查询到的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 选择的新的角色ID
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: result } = await this.$http.get('users', { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取用户列表失败！')
      }
      this.userList = result.data.users
      this.total = result.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange (newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.queryInfo.pagenum = 1
      this.getUserList()
    },
    // 监听页码改变事件
    handleCurrentChange (newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getUserList()
    },
    // 监听用户状态改变
    async userStateChanged (userInfo) {
      const { data: result } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (result.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(result.meta.msg || '更新用户状态失败')
      }

      this.$message.success('用户状态更新')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addUserFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser () {
      this.$refs.addUserFormRef.validate(async valid => {
        console.log(valid)
        // 验证不通过，直接返回
        if (!valid) return false
        // 验证通过，提交服务端
        const { data: result } = await this.$http.post('users', this.addUserForm)
        if (result.meta.status !== 201) {
          // 提示失败
          return this.$message.error(result.meta.msg || '添加用户失败！')
        }
        // 提示成功
        this.$message.success('添加用户成功！')
        // 关闭对话框
        this.addDialogVisible = false
        // 刷新列表
        this.getUserList()
      })
    },
    // 显示编辑用户的对话框
    async showEditDialog ({ id }) {
      const { data: result } = await this.$http.get(`users/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '查询用户信息失败！')
      }
      // 将查询到的用户信息保存
      this.editForm = result.data
      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        // 数据校验失败，直接返回
        if (!valid) return false
        // 数据验证通过，发送修改请求
        const { data: result } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })

        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '更新用户信息失败！')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新用户列表
        this.getUserList()
        // 弹出提示信息
        this.$message.success('更新用户信息成功！')
      })
    },
    // 根据ID删除对应的用户数据
    async removeUserById ({ id }) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: result } = await this.$http.delete(`users/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '删除用户失败！')
      }

      this.$message.success('删除用户成功！')
      this.getUserList()
    },
    // 展示分配角色对话框
    async setRole (userInfo) {
      // 获取所有角色的列表
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取角色列表失败！')
      }
      this.rolesList = result.data
      this.userInfo = userInfo
      this.setRoleDialogVisible = true
    },
    // 点击按钮分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data: result } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '更新角色失败！')
      }

      this.$message.success('更新角色成功！')
      this.setRoleDialogVisible = false
      this.getUserList()
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="stylus" scoped>
  .el-table
    margin-top 15px
    font-size 12px
</style>
