<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
              v-model="selectedCaateKeys"
              :options="cateList"
              :props="cateProps"
              @change="handleChange"
              clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model.trim="scope.row.inputValue"
                  :ref="`${scope.row.attr_id}SaveTagInputRef`"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model.trim="scope.row.inputValue"
                  :ref="`${scope.row.attr_id}SaveTagInputRef`"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="`添加${titleText}`"
      :visible.sync="addDialogVisible"
      @close="addDialogClosed"
      width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="`修改${titleText}`"
      :visible.sync="editDialogVisible"
      @close="editDialogClosed"
      width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'params',
  data () {
    return {
      // 所有商品分类数据列表
      cateList: [],
      // 指定联级选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的值
      selectedCaateKeys: [],
      // 被激活的tab页签的名称
      activeName: 'many',
      // 动态参数表格数据
      manyTableData: [],
      // 静态属性表格数据
      onlyTableData: [],
      // 控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改参数对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {
        attr_id: '',
        attr_name: ''
      },
      // 修改参数表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCaateList()
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled () {
      return this.selectedCaateKeys.length !== 3
    },
    // 当前选中的三级分类的ID
    cateId () {
      if (this.selectedCaateKeys.length === 3) {
        return this.selectedCaateKeys[2]
      }

      return null
    },
    // 动态计算标题的文本
    titleText () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  },
  methods: {
    // 获取所有的商品分类
    async getCaateList () {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取商品分类失败！')
      }
      this.cateList = result.data
    },
    // 监听级联选择框选中值的变化
    async handleChange () {
      this.getParamsData()
    },
    // tab 页签点击事件
    handleClick (tab, event) {
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData () {
      // 只能选中三级分类，若不是三级分类，直接置空
      if (this.selectedCaateKeys.length !== 3) {
        this.manyTableData = []
        this.onlyTableData = []
        this.selectedCaateKeys = []
        return false
      }
      // 根据所选分类的ID，和当前所处的面板，获取对应的参数
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取参数列表失败！')
      }

      result.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制按钮与文本框的显示隐藏
        item.inputVisible = false
        // 文本框中输入的内容
        item.inputValue = ''
      })
      // 根据不同的面板显示不同的表格数据
      if (this.activeName === 'many') {
        this.manyTableData = result.data
      } else {
        this.onlyTableData = result.data
      }
    },
    // 监听添加对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: result } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 201) {
          return this.$message.error(result.meta.msg || '添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击按钮，显示修改对话框
    async showEditDialog (attr_id) {
      const { data: result } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取参数信息失败！')
      }
      this.editForm = result.data
      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 根据 ID 删除对应的参数项
    removeParams (attr_id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: result } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '删除失败！')
        }
        this.$message.success('删除成功！')
        this.getParamsData()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 点击按钮显示文本输入框
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs[`${row.attr_id}SaveTagInputRef`].$refs.input.focus()
      })
    },
    // 文本框失去焦点或者按下enter键都会触发
    async handleInputConfirm (row) {
      row.inputValue = row.inputValue.trim()
      if (row.inputValue.length > 0) {
        // 如果输入了内容就保存数据
        row.attr_vals.push(row.inputValue)
        if (!await this.saveAttrVals(row)) {
          row.attr_vals.pop()
        }
      }
      row.inputValue = ''
      row.inputVisible = false
    },
    // 将对 attr_vals 的操作保存到数据库
    async saveAttrVals (row) {
      const { data: result } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (result.meta.status !== 200) {
        this.$message.error(result.meta.msg || '修改参数项失败！')
        return false
      } else {
        this.$message.success('修改参数项成功！')
        return true
      }
    },
    // 删除对应的参数和选项
    async handleClose (i, row) {
      const _row = JSON.parse(JSON.stringify(row))
      _row.attr_vals.splice(i, 1)
      if (await this.saveAttrVals(_row)) {
        row.attr_vals.splice(i, 1)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.cat_opt
  margin 15px 0px
.el-tag
  margin 10px
.input-new-tag
  width 120px
</style>
