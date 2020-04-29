<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        show-index
        index-text="#"
        border>
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i v-if="!scope.row.cat_deleted" class="el-icon-success" style="color: lightgreen"></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCategories(scope.row)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :total="total"
        :page-sizes="[5, 10, 15, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        background>
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClosed"
      title="添加分类"
      width="50%">
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              clearable
              change-on-select
              @change="parentCateChanged">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      @close="editCateDialogClosed"
      width="50%">
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'cate',
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 分类的父级ID
        cat_pid: 0,
        // 分类的等级：0--一级，1--二级，2--三级，默认0
        cat_level: 0
      },
      // 添加分类的表单验证对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的数据列表
      parentCateList: [],
      // 指定联级选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的ID数组
      selectedKeys: [],
      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 编辑分类表单数据对象
      editCateForm: {
        cat_id: 0,
        cat_name: ''
      },
      // 修改分类的表单验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: result } = await this.$http.get('categories', { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取商品分类失败！')
      }
      // 把数据列表赋值给cateList
      this.cateList = result.data.result
      // 为总数据条数赋值
      this.total = result.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.queryInfo.pagenum = 1
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: result } = await this.$http.get('categories', { params: { type: 2 } })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取父级分类数据失败！')
      }
      this.parentCateList = result.data
    },
    // 监听级联选择框选中项发生变化事件
    parentCateChanged () {
      console.log(this.selectedKeys)
      // 先重置数据
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      // 如果选中的ID长度大于0，证明选择了父级分类
      if (this.selectedKeys.length > 0) {
        // 取出父级分类的ID
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      }
    },
    // 监听添加分类对话框关闭事件
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.selectedKeys = []
    },
    // 点击按钮添加分类
    addCate () {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return false
        const { data: result } = await this.$http.post('categories', this.addCateForm)
        if (result.meta.status !== 201) {
          return this.$message.error(result.meta.msg || '添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    },
    // 监听修改分类对话框的关闭事件
    editCateDialogClosed () {
      // 重置修改的表单项
      this.$refs.editCateFormRef.resetFields()
    },
    // 显示修改分类的对话框
    async showEditCateDialog (cateInfo) {
      // 加载最新的分类信息
      const { data: result } = await this.$http.get(`categories/${cateInfo.cat_id}`)
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '分类信息获取失败！')
      }

      // 将分类名称保存，供编辑时使用
      this.editCateForm.cat_id = result.data.cat_id
      this.editCateForm.cat_name = result.data.cat_name
      // 显示修改对话框
      this.editCateDialogVisible = true
    },
    // 点击按钮，提交修改数据
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return false
        const { data: result } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '修改分类失败！')
        }
        // 提示成功
        this.$message.success('修改分类成功！')
        // 关闭对话框
        this.editCateDialogVisible = false
        // 更新列表数据
        this.getCateList()
      })
    },
    // 删除分类
    removeCategories (cateInfo) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: result } = await this.$http.delete(`categories/${cateInfo.cat_id}`)
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg || '分类删除失败！')
        }

        this.getCateList()
        this.$message.success('分类删除成功!')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.tree-table
  margin-top 15px
.el-cascader
  width 100%
</style>
