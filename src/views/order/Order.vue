<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table
        :data="orderList"
        border
        stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressDialog(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[10, 20, 50]"
        :page-size="queryInfo.pagesize"
        :current-page="queryInfo.pagenum"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </el-card>
    <!-- 修改对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      @close="editDialogClosed"
      width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="editForm.address1"
            :options="cityData">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: 'order',
  data () {
    return {
      // 订单列表查询条件对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单总条数
      total: 0,
      // 订单列表数据
      orderList: [],
      // 控制修改地址对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑地址表单对象
      editForm: {
        address1: [],
        address2: ''
      },
      // 编辑地址表单对象验证规则
      editFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 省市区数据对象
      cityData,
      // 控制物流进度的显示与隐藏
      progressDialogVisible: false,
      // 物流信息数据
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 查询订单列表数据
    async getOrderList () {
      const { data: result } = await this.$http.get('orders', { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取订单列表失败！')
      }
      this.total = result.data.total
      this.orderList = result.data.goods
    },
    // 监听分页容量改变事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听分页页码改变事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示修改地址的对话框
    showEditDialog () {
      this.editDialogVisible = true
    },
    // 监听编辑地址对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 显示物流进度对话框
    async showProgressDialog () {
      const { data: result } = await this.$http.get('kuaidi/1106975712662')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg || '获取物流进度失败！')
      }
      console.log(result.data)
      this.progressInfo = result.data
      this.progressDialogVisible = true
    }
  }
}
</script>

<style lang="stylus" scoped>
.el-cascader
  width 100%
</style>
