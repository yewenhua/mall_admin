<template>
    <div>
        <PageTitle title="订单列表"></PageTitle>
        <div class="pageWrapper">
            <div class="lookWrapper">
                <div class="searchWrapper">
                    <el-select v-model="check" placeholder="是否已读" size="medium" @change="checkChg" style="width: 110px;">
                        <el-option key="全部状态" label="全部状态" :value="'ALL'"></el-option>
                        <el-option key="已读" label="已读" :value="'READ'"></el-option>
                        <el-option key="未读" label="未读" :value="'UNREAD'"></el-option>
                    </el-select>
                    <el-select v-model="status" placeholder="订单状态" size="medium" @change="statusChg" style="width: 110px;">
                        <el-option key="全部订单" label="全部订单" :value="'ALL'"></el-option>
                        <el-option key="待接单" label="待接单" :value="'CREATED'"></el-option>
                        <el-option key="待安装" label="待安装" :value="'ACCEPTED'"></el-option>
                        <el-option key="已安装" label="已安装" :value="'FIXED'"></el-option>
                        <el-option key="已完成" label="已完成" :value="'FINISHED'"></el-option>
                        <el-option key="退货中" label="退货中" :value="'REJECTING'"></el-option>
                        <el-option key="已关闭" label="已关闭" :value="'CLOSED'"></el-option>
                    </el-select>
                    <el-input placeholder="请输入搜索关键字" v-model="searchkey" size="medium" style="width: 250px;">
                        <el-button slot="append" size="medium" icon="el-icon-search" @click="search">搜索</el-button>
                    </el-input>
                    <el-button type="primary" size="medium" icon="el-icon-download" @click="download">导出订单</el-button>
                </div>
                <el-table
                        ref="table"
                        :data="tableData"
                        stripe
                        border
                        empty-text="暂无数据"
                        v-loading="loading"
                        cell-class-name="txt-center"
                        header-cell-class-name="txt-center"
                        @selection-change="handleSelectionChange"
                        style="width: 100%">

                    <el-table-column
                            type="index"
                            :index="indexMethod">
                    </el-table-column>
                    <el-table-column
                            prop="orderid"
                            label="订单号">
                    </el-table-column>
                    <el-table-column
                            prop="receiver"
                            label="用户">
                    </el-table-column>
                    <el-table-column
                            prop="goodsName"
                            label="商品标题">
                    </el-table-column>
                    <el-table-column
                            prop="goodsCode"
                            width="80"
                            label="商品型号">
                    </el-table-column>
                    <el-table-column
                            prop="goodsSpec"
                            width="80"
                            label="商品颜色">
                    </el-table-column>
                    <el-table-column
                            prop="amount"
                            width="80"
                            label="商品价格">
                    </el-table-column>
                    <el-table-column
                            prop="img"
                            width="100"
                            label="商品主图">
                        <template slot-scope="scope">
                            <el-popover
                                    placement="left"
                                    width="400"
                                    trigger="click">
                                <img class="pop_img" :src="scope.row.img"/>
                                <img class="face_img" :src="scope.row.img" slot="reference"/>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="adminViewed"
                            width="80"
                            label="是否已读">
                        <template slot-scope="scope">
                            <div class="status" :class="scope.row.adminViewed ? 'read' : 'unread'">{{scope.row.adminViewed ? '已读' : '未读'}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="orderStatus"
                            width="80"
                            label="订单状态">
                        <template slot-scope="scope">
                            <div class="status" :class="scope.row.orderStatus == 'CREATED' ? 'created' : scope.row.orderStatus == 'ACCEPTED' ? 'accepted' : scope.row.orderStatus == 'FIXED' ? 'fixed' : scope.row.orderStatus == 'FINISHED' ? 'finished' : ''">{{scope.row.orderStatusName}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="agentName"
                            label="所属代理商">
                    </el-table-column>
                    <el-table-column
                            prop="created_at"
                            width="100"
                            label="创建时间">
                        <template slot-scope="scope">
                            <div>{{scope.row.createDate ? scope.row.createDate.substring(0, 10) : ''}}</div>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="150">
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    type="success"
                                    @click="handleDetail(scope.$index, scope.row)">详情</el-button>
                            <el-button
                                    size="mini"
                                    type="primary"
                                    :disabled="scope.row.orderStatus == 'FIXED' || scope.row.orderStatus == 'FINISHED' ? false : true"
                                    @click="remark(scope.$index, scope.row)">备注</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page.sync="currentPage"
                        :page-size="perPage"
                        layout="total, prev, pager, next"
                        :total="total">
                </el-pagination>
                <div class="batch_delete">
                </div>
                <el-dialog title="订单详情" :visible.sync="dialogVisible" :modal-append-to-body="false" class="child-dialog" @close="close">
                    <div class="customer">
                        <div class="item">
                            <div class="left">
                                <span class="name">产品名称：</span>
                                <span class="content">{{detail.goodsName}}</span>
                            </div>
                            <div class="right">
                                <span class="name">产品颜色：</span>
                                <span class="content">{{detail.goodsSpec}}</span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="left">
                                <span class="name">产品图片：</span>
                                <span class="content">
                                    <el-popover
                                            placement="right"
                                            width="400"
                                            trigger="click">
                                        <img class="pop_img" :src="getImg('main', detail.goodsImage)"/>
                                        <img class="pro-img" :src="getImg('main', detail.goodsImage)" slot="reference"/>
                                    </el-popover>
                                </span>
                            </div>
                            <div class="right">
                                <span class="name">导向板：</span>
                                <span class="content">
                                    <el-popover
                                            v-if="detail && detail.directorImage"
                                            placement="right"
                                            width="400"
                                            trigger="click">
                                        <img class="pop_img" :src="dxbImg(detail.directorImage)"/>
                                        <img class="pro-img" :src="dxbImg(detail.directorImage)" slot="reference"/>
                                    </el-popover>
                                    <div v-if="detail && !detail.directorImage">用户未上传</div>
                                </span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="left">
                                <span class="name">产品型号：</span>
                                <span class="content">{{detail.goodsCode}}</span>
                            </div>
                            <div class="right">
                                <span class="name">订单号码：</span>
                                <span class="content">{{detail.orderNo}}</span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="left">
                                <span class="name">下单时间：</span>
                                <span class="content">{{detail.placeDate ? detail.placeDate.substring(0, 10) : ''}}</span>
                            </div>
                            <div class="right">
                                <span class="name">订单价格：</span>
                                <span class="content">￥{{detail.amount}}元</span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="left">
                                <span class="name">用户姓名：</span>
                                <span class="content">{{detail.receiver}}</span>
                            </div>
                            <div class="right">
                                <span class="name">用户手机：</span>
                                <span class="content">{{detail.mobile}}</span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="left">
                                <span class="name">用户地址：</span>
                                <span class="content">{{detail.address}}</span>
                            </div>
                            <div class="right">
                                <span class="name">预约时间：</span>
                                <span class="content">{{detail.appointmentDate ? detail.appointmentDate.substring(0, 10) : ''}}</span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="left">
                                <span class="name">订单状态：</span>
                                <span class="content">{{detail.orderStatusName}}</span>
                            </div>
                            <div class="right">
                                <span class="name">安装时间：</span>
                                <span class="content">{{detail.fixDate ? detail.fixDate.substring(0, 10) : ''}}</span>
                            </div>
                        </div>
                        <div class="item" v-if="detail.cancelReason">
                            <span class="name">取消理由：</span>
                            <span class="content">{{detail.cancelReason ? detail.cancelReason : ''}}</span>
                        </div>
                        <div class="item">
                            <span class="name">存档卡片：</span>
                            <span class="content">
                                <el-popover
                                        v-if="detail && detail.fixCard"
                                        placement="right"
                                        width="400"
                                        trigger="click">
                                    <img class="pop_img" :src="cdImg(detail.fixCard)"/>
                                    <img class="pro-img" :src="cdImg(detail.fixCard)" slot="reference"/>
                                </el-popover>
                                <div v-if="detail && !detail.fixCard">代理未上传</div>
                            </span>
                        </div>
                        <div class="item" v-if="detail.productScore > 0">
                            <span class="name">产品评价：</span>
                            <span class="content">
                                <Star :point="detail.productScore"></Star>
                            </span>
                        </div>
                        <div class="item" v-if="detail.productScore > 0">
                            <span class="name">安装响应：</span>
                            <span class="content">
                                <Star :point="detail.promptScore"></Star>
                            </span>
                        </div>
                        <div class="item" v-if="detail.productScore > 0">
                            <span class="name">服务态度：</span>
                            <span class="content">
                                <Star :point="detail.attitudeScore"></Star>
                            </span>
                        </div>
                        <div class="item cmbg" v-if="detail.productScore > 0">
                            <span class="name">评价图片：</span>
                            <span class="content">
                                <el-popover
                                        placement="right"
                                        popper-class="cimg-pop"
                                        width="400"
                                        trigger="click" v-if="detail && detail.imgs && detail.imgs.length > 0" v-for="(val, idx) in detail.imgs" :key="idx">
                                    <img class="pop_cimg" :src="val"/>
                                    <img class="cmImg" :src="val" slot="reference"/>
                                </el-popover>
                                <span v-if="detail && detail.imgs && detail.imgs.length == 0">没有评论图片</span>
                            </span>
                        </div>
                        <div class="item" v-if="detail.productScore > 0">
                            <span class="name">评价内容：</span>
                            <span class="content">{{detail.commentContent ? detail.commentContent : '无'}}</span>
                        </div>
                        <div class="item" v-if="detail.adminRemark">
                            <span class="name">备注：</span>
                            <span class="content">{{detail.adminRemark}}</span>
                        </div>
                        <div class="item" v-if="detail.rejectStatusName">
                            <span class="name">退货进度：</span>
                            <span class="content">{{detail.rejectStatusName}}</span>
                        </div>
                        <div class="item" v-if="detail.rejectApplyDate">
                            <div class="left">
                                <span class="name">申请时间：</span>
                                <span class="content">{{detail.rejectApplyDate}}</span>
                            </div>
                            <div class="right">
                                <span class="name">处理时间：</span>
                                <span class="content">{{detail.rejectFinishDate}}</span>
                            </div>
                        </div>
                        <div class="item" v-if="detail.rejectReason">
                            <span class="name">退货理由：</span>
                            <span class="content">{{detail.rejectReason}}</span>
                        </div>
                        <div class="item cmbg" v-if="detail.rejectReason">
                            <span class="name">退货图片：</span>
                            <span class="content">
                                <el-popover
                                        placement="right"
                                        popper-class="cimg-pop"
                                        width="400"
                                        trigger="click" v-if="detail && detail.rejectImages && detail.rejectImages.length > 0" v-for="(val, idx) in detail.rejectImages" :key="idx">
                                    <img class="pop_cimg" :src="val"/>
                                    <img class="cmImg" :src="val" slot="reference"/>
                                </el-popover>
                                <span v-if="detail && detail.rejectImages && detail.rejectImages.length == 0">没有退货图片</span>
                            </span>
                        </div>
                    </div>
                </el-dialog>
                <el-dialog title="备注信息" :visible.sync="remarkVisible" :modal-append-to-body="false" class="child-dialog">
                    <el-input
                            type="textarea"
                            :rows="5"
                            placeholder="请输入备注内容"
                            v-model="textarea">
                    </el-input>
                    <el-button type="primary" size="medium" class="btnmt" :disabled="!textarea" @click="sbRemark">提交</el-button>
                </el-dialog>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import { mapState, mapGetters } from 'vuex'
    import {
        Table,
        TableColumn,
        Pagination,
        Input,
        Button,
        Form,
        FormItem,
        Message,
        Loading,
        MessageBox,
        Select,
        Option,
        Switch,
        Checkbox,
        CheckboxButton,
        CheckboxGroup,
        Dialog,
        Popover,
        Upload
    } from 'element-ui'
    import PageTitle from '../../frame/PageTitle.vue'
    import Star from './Star.vue'
    import { checkToken }  from '../../ajax';
    import { aesencode, aesdecode }  from '../../utils';

    Vue.use(Table);
    Vue.use(TableColumn);
    Vue.use(Pagination);
    Vue.use(Input);
    Vue.use(Button);
    Vue.use(Form);
    Vue.use(FormItem);
    Vue.use(Loading);
    Vue.use(Select);
    Vue.use(Option);
    Vue.use(Switch);
    Vue.use(Checkbox);
    Vue.use(CheckboxButton);
    Vue.use(CheckboxGroup);
    Vue.use(Dialog);
    Vue.use(Popover);
    Vue.use(Upload);
    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$message = Message;

    export default {
        computed: {
            ...mapState(["domainUrl", 'baseURL', 'userInfo'])
        },
        data(){
            return {
                currentPage: 1,
                perPage: 10,
                total: 1,
                detail: '',
                activeId: '',
                searchkey: '',
                textarea: '',
                status: 'ALL',
                check: 'ALL',
                loading: false,
                tableData: [],
                multipleSelection: [],
                dialogVisible: false,
                remarkVisible: false
            }
        },
        methods:{
            handleSizeChange(val) {

            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.lists();
            },
            lists(){
                let that = this;
                that.loading = true;
                let params = {
                    num: that.perPage,
                    page: that.currentPage,
                    privilege: encodeURIComponent(aesencode('read'))
                };

                if(that.check != 'ALL'){
                    params.adminViewed = that.check == 'READ' ? true : false;
                }

                if(that.status != 'ALL'){
                    params.orderStatus = that.status;
                }


                that.axios.get('/order/page', {
                    params: {
                        num: that.perPage,
                        page: that.currentPage,
                        search: that.searchkey,
                        privilege: encodeURIComponent(aesencode('read'))
                    }
                })
                .then(function (response) {
                    if (response.data.code == 0) {
                        if(response.data.data.data.length > 0){
                            for(let i=0; i<response.data.data.data.length; i++){
                                //response.data.data.data[i].img = that.getImg('main', response.data.data.content[i].goodsImage);
                            }
                        }
                        that.tableData = response.data.data.data;
                        that.total = response.data.data.total;
                    }
                    that.loading = false;
                })
                .catch(function (error) {
                    Message.error({
                        message: '未知错误'
                    });
                    that.loading = false;
                });
            },
            indexMethod(index){
                return index + 1;
            },
            search(){
                this.currentPage = 1;
                this.total = 1;
                this.tableData = [];
                this.lists();
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            getImg(type, img){
                if(type == 'main'){
                    return this.domainUrl + '/goods/image/' + img + '?imageType=GOODS_IMAGE';
                }
                else{
                    return this.domainUrl + '/goods/image/' + img + '?imageType=GOODS_DETAIL';
                }
            },
            dxbImg(img){
                return this.domainUrl + '/order/directorImage/' + img;
            },
            cdImg(img){
                return this.domainUrl + '/admin/order/fixCard/' + img;
            },
            commentImg(img){
                return this.domainUrl + '/admin/comment/commentImage/' + img;
            },
            rejectImg(img){
                return this.domainUrl + '/admin/reject/rejectImage/' + img;
            },
            handleDetail(index, row) {
                let that = this;
                that.loading = true;
                that.axios.get('/order/detail', {
                    params: { //请求参数
                        idstr: row.idstr,
                        privilege: encodeURIComponent(aesencode('read'))
                    }
                })
                .then(function (response) {
                    if (response.data.code == 0) {
                        that.dialogVisible = true;
                        let commentImages = [];
                        let arr = [];
                        if (commentImages && commentImages.indexOf(',') !== -1){
                            let tmp = commentImages.split(',');
                            for (let i = 0; i < tmp.length; i++){
                                let img = that.commentImg(tmp[i]);
                                arr.push(img);
                            }
                        }
                        else if (commentImages){
                            let img = that.commentImg(commentImages);
                            arr.push(img);
                        }
                        response.data.data.imgs = arr;

                        let rejectImages = [];
                        let rejectArr = [];
                        if (rejectImages && rejectImages.indexOf(',') !== -1){
                            let tmp = rejectImages.split(',');
                            for (let i = 0; i < tmp.length; i++){
                                let img = that.rejectImg(tmp[i]);
                                rejectArr.push(img);
                            }
                        }
                        else if (rejectImages){
                            let img = that.rejectImg(rejectImages);
                            rejectArr.push(img);
                        }
                        response.data.data.rejectImages = rejectArr;

                        that.detail = response.data.data;
                    }
                    else{
                        Message.warning({
                            message: response.data.message
                        });
                    }
                    that.loading = false;
                })
                .catch(function (error) {
                    Message.error({
                        message: '未知错误'
                    });
                    that.loading = false;
                });
            },
            remark(index, row){
                this.remarkVisible = true;
                this.activeId = row.id;
                this.textarea = row.adminRemark;
            },
            sbRemark(){
                let that = this;
                that.loading = true;
                that.axios.post('/order/remark', {
                    orderId: that.activeId,
                    remark: that.textarea
                })
                .then(function (response) {
                    that.loading = false;
                    that.remarkVisible = false;
                    if (response.data.code == 0) {
                        Message.success({
                            message: '操作成功'
                        });

                        that.textarea = '';
                        that.activeId = '';
                        that.lists();
                    }
                    else{
                        that.activeId = '';
                        Message.warning({
                            message: response.data.msg
                        });
                    }
                })
                .catch(function (error) {
                    that.loading = false;
                    that.activeId = '';
                    Message.warning({
                        message: '未知错误'
                    });
                });
            },
            statusChg(){
                this.search()
            },
            checkChg(){
                this.search()
            },
            close(){
                this.lists();
            },
            download(){
                let url = this.baseURL + "/admin/order/download?a=1";
                if(this.check != 'ALL'){
                    if(this.check == 'READ') {
                        url = url + '&adminViewed=' + true;
                    }
                    else{
                        url = url + '&adminViewed=' + false;
                    }
                }

                if(this.status != 'ALL'){
                    url = url + '&orderStatus=' + this.status;
                }

                if(this.searchkey){
                    url = url + '&text=' + this.searchkey;
                }

                window.open(url);
            }
        },
        components: {
            PageTitle,
            Star
        },
        watch: {

        },
        mounted() {
            this.lists();
        }
    }
</script>
<style>
    .el-form-item__content .edui-toolbar{
        line-height: normal;
    }
    .status.created{
        color: #F56C6C;
    }
    .status.accepted{
        color: #409EFF;
    }
    .status.fixed{
        color: #E6A23C;
    }
    .status.finished{
        color: green;
    }
    .status.read{
        color: green;
    }
    .status.unread{
        color: red;
    }
    .customer{
        width: 100%;
        position: relative;
    }
    .customer .item{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        border-bottom: 0.01rem solid #ebeef5;
    }
    .customer .left{
        width: 50%;
        box-sizing: border-box;
        position: relative;
    }
    .customer .right{
        position: relative;
        width: 50%;
        box-sizing: border-box;
    }
    .customer .item .name{
        width: 75px;
        display: inline-block;
        line-height: 45px;
    }
    .customer .item .content{
        width: calc( 100% - 75px );
        line-height: 45px;
    }
    .pro-img{
        height: 100px;
        display: block;
        margin-bottom: 10px;
    }
    .customer .item.cmbg .content{
        display: flex;
        align-items: center;
        flex-direction: row;
        height: 100px;
        line-height: 100px;
    }
    .customer .item.cmbg .name{
        height: 100px;
        line-height: 100px;
    }
    .cmImg{
        display: block;
        width: 80px;
        height: 80px;
        margin-right: 15px;
    }
    .pop_cimg{
        max-width: 400px;
        max-height: 400px;
    }
    .cimg-pop{
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .btnmt{
        margin-top: 15px;
    }
</style>