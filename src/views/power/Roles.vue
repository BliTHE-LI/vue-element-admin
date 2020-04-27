<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- <pre>{{scope.row}}</pre> -->
            <el-row class="bdbottom v-center" :class="{'bdtop': i1 === 0}" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环嵌套渲染二级权限 -->
                <el-row class="v-center" :class="{'bdtop': i2 > 0}" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      type="success">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过 for 循环嵌套渲染三级权限 -->
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDailog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoles(scope.row)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      :visible.sync="addRoleDialogVisible"
      :close-on-click-modal="false"
      @close="addRoleDialogClosed"
      title="添加角色"
      width="50%">
      <el-form
        :model="addRoleForm"
        :rules="roleFormRules"
        label-width="100px"
        ref="addRoleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
      :visible.sync="editRoleDialogVisible"
      :close-on-click-modal="false"
      @close="editRoleDialogClosed"
      title="修改角色"
      width="50%">
      <el-form
        :model="editRoleForm"
        :rules="roleFormRules"
        label-width="100px"
        ref="editRoleFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName" clearable></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc" clearable></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      @close="setRightDialogClosed"
      :visible.sync="setRightDialogVisible"
      :close-on-click-modal="false"
      width="50%">
      <!-- 树形控件 -->
      <el-tree
        ref="rightsTreeRef"
        :data="rightsTree"
        :props="rightsTreeProps"
        :default-checked-keys="defKeys"
        node-key="id"
        show-checkbox
        default-expand-all>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'roles',
  data () {
    return {
      // 所有角色列表数据
      roleList: [],
      // 控制添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 添加角色表单项
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单的验证规则对象
      roleFormRules: {
        roleName: [
          { required: true, message: '请填写角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请填写角色描述', trigger: 'blur' }
        ]
      },
      // 控制修改角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      // 修改角色表单项
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsTree: {},
      // 树形控件的属性绑定对象
      rightsTreeProps: {
        // 指定子树为节点对象的某个属性值
        children: 'children',
        // 指定节点标签为节点对象的某个属性值
        label: 'authName'
      },
      // 默认选中的节点ID值
      defKeys: [105],
      // 当前即将分配权限的角色ID
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList () {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取角色列表失败！')
      }
      this.roleList = result.data
      console.log(this.roleList)
    },
    // 监听添加角色对话框关闭事件
    addRoleDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击按钮，添加新的角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: result } = await this.$http.post('roles', this.addRoleForm)
        if (result.meta.status !== 201) {
          return this.$message.error(result.meta.msg || '角色创建失败！')
        }
        this.addRoleDialogVisible = false
        this.getRolesList()
        this.$message.success('角色创建成功！')
      })
    },
    // 显示修改角色窗口
    async showEditDailog ({ id }) {
      const { data: result } = await this.$http.get(`roles/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('角色信息获取失败！')
      }

      this.editRoleForm = result.data
      this.editRoleDialogVisible = true
    },
    // 监听修改角色窗口关闭事件
    editRoleDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 编辑用户信息，并提交服务器
    editRole () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: result } = await this.$http.put(`roles/${this.editRoleForm.roleId}`, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '角色信息修改失败！')
        }
        this.editRoleDialogVisible = false
        this.getRolesList()
        this.$message.success('角色信息修改成功！')
      })
      this.editRoleDialogVisible = false
    },
    // 删除角色
    removeRoles ({ id }) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: result } = await this.$http.delete(`roles/${id}`)
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '删除角色失败！')
        }
        this.$message.success('删除角色成功！')
        this.getRolesList()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 根据ID删除对应的权限
    removeRightById (role, rightId) {
      // 弹框提示是否要删除
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: result } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '删除权限失败！')
        }
        this.$message.success('删除权限成功！')
        // 为了防止下拉表格关闭，直接将服务器返回的角色的最新权限替换掉，不进行列表的刷新
        role.children = result.data
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 获取所有权限的数据
      const { data: result } = await this.$http.get('rights/tree')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg, '获取权限数据失败！')
      }
      // 将获取到的权限数据保存
      this.rightsTree = result.data
      // 递归获取当前角色的三级权限ID
      this.getLeafKeys(role, this.defKeys)
      this.roleId = role.id
      // 打开对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的方式获取角色下的所有三级权限的ID，并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前节点不包含children属性，则是三级权限节点
      if (!node.children) {
        return arr.push(node.id)
      }

      // 递归获取
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      // 重置选中的权限节点
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.rightsTreeRef.getCheckedKeys(),
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys()
      ]
      const { data: result } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keys.join(',') })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '分配权限失败！')
      }

      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="stylus" scoped>
.el-table
  margin-top 15px
.bdtop
  border-top 1px solid #eee
.bdbottom
  border-bottom 1px solid #eee
.el-tag
  margin 7px
.v-center
  display flex
  align-items center
</style>
