<template>
    <div class="logistics-page">
        <PageTitle title="邮费设置"></PageTitle>
        <div class="pageWrapper">
            <div class="lookWrapper" v-if="!edit">
                <div class="searchWrapper">
                    <el-input placeholder="请输入内容" v-model="searchkey" size="medium">
                        <el-button slot="append" size="medium" icon="el-icon-search" @click="search">搜索</el-button>
                    </el-input>
                    <el-button type="primary" size="medium" class="addBtn" icon="el-icon-plus" @click="add" v-if="hasPermission('admin/logistics', 'add')">添加</el-button>
                </div>
                <el-table
                        :data="tableData"
                        stripe
                        border
                        empty-text="暂无数据"
                        v-loading="loading"
                        @selection-change="handleSelectionChange"
                        style="width: 100%">
                    <el-table-column
                            type="selection"
                            width="50">
                    </el-table-column>
                    <el-table-column
                            type="index"
                            width="30"
                            :index="indexMethod">
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            label="模板名称">
                    </el-table-column>
                    <el-table-column
                            prop="isopen"
                            width="80"
                            align="center"
                            label="是否开启">
                        <template slot-scope="scope">
                            <div>{{scope.row.isopen == 1 ? '是' : '否'}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="send_list"
                            label="配送区域">
                        <template slot-scope="scope">
                            <div v-for="(val, index) in scope.row.send_list" :key="index">
                                <div v-if="val.select_all">
                                    <span class="fee-container">首重：<font class="text-info">{{val.first_weight}}</font>克，首费：<font class="text-info">{{val.first_fee}}</font>元，续重：<font class="text-info">{{val.other_weight}}</font>克，续费：<font class="text-info">{{val.other_fee}}</font>元</span>
                                    <span class="text-warning">配送区域：</span><span>全国{{val.isDefault ? '（默认）' : ''}}</span>
                                </div>
                                <div v-if="!val.select_all">
                                    <span class="fee-container">首重：<font class="text-info">{{val.first_weight}}</font>克，首费：<font class="text-info">{{val.first_fee}}</font>元，续重：<font class="text-info">{{val.other_weight}}</font>克，续费：<font class="text-info">{{val.other_fee}}</font>元</span>
                                    <span class="text-warning">配送区域：</span><span v-for="(addr, idx) in val.addr_list" :key="idx">{{addr}}{{idx != val.addr_list.length - 1 ? ',' : ''}}</span>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="created_at"
                            width="100"
                            label="创建日期">
                        <template slot-scope="scope">
                            <div>{{scope.row.created_at ? scope.row.created_at.substring(0, 10) : ''}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" align="center" v-if="(hasPermission('admin/logistics', 'update') || hasPermission('admin/logistics', 'delete'))">
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    type="primary"
                                    v-if="hasPermission('admin/role', 'update')"
                                    @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button
                                    size="mini"
                                    type="danger"
                                    v-if="hasPermission('admin/role', 'delete')"
                                    @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
                <div class="batch_delete" v-if="hasPermission('admin/logistics', 'delete')">
                    <el-button type="danger" :disabled="multipleSelection.length <= 0" @click="batchDelete">批量删除</el-button>
                </div>
            </div>

            <div class="updateWrapper" v-if="edit">
                <div class="title">请填写以下信息</div>
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" label-position="top" v-loading="loading">
                    <el-form-item label="模板名称" prop="name">
                        <el-input v-model="ruleForm.name" placeholder="请输入模板名称"></el-input>
                    </el-form-item>
                    <el-form-item label="配送区域" prop="send_list">
                        <div class="add-area">
                            <el-button type="primary" size="mini" icon="el-icon-plus" @click="addArea" v-if="hasPermission('admin/logistics', 'add')">新增配送区域</el-button>
                        </div>
                        <el-table
                                :data="ruleForm.send_list"
                                stripe
                                border
                                empty-text="暂无数据"
                                v-loading="loading"
                                style="width: 100%">
                            <el-table-column
                                    prop="first_weight"
                                    width="120"
                                    label="首重（克）">
                            </el-table-column>
                            <el-table-column
                                    prop="first_fee"
                                    width="120"
                                    label="首费（元）">
                            </el-table-column>
                            <el-table-column
                                    prop="other_weight"
                                    width="120"
                                    label="续重（克）">
                            </el-table-column>
                            <el-table-column
                                    prop="other_fee"
                                    width="120"
                                    label="续费（元）">
                            </el-table-column>
                            <el-table-column
                                    prop="addr_list"
                                    label="配送省份">
                                <template slot-scope="scope">
                                    <div class="area-list-td">
                                        <span v-for="(city, index) in scope.row.addr_list" :key="index" v-if="city != '全国' && !scope.row.select_all">{{city}}</span>
                                        <span v-if="scope.row.select_all">全国{{scope.row.isDefault ? '（默认）' : ''}}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="150" v-if="(hasPermission('admin/logistics', 'update') || hasPermission('admin/logistics', 'delete'))">
                                <template slot-scope="scope">
                                    <el-button
                                            size="mini"
                                            type="primary"
                                            v-if="hasPermission('admin/logistics', 'update')"
                                            @click="areaEdit(scope.$index, scope.row)">编辑</el-button>
                                    <el-button
                                            size="mini"
                                            type="danger"
                                            v-if="hasPermission('admin/logistics', 'delete')"
                                            @click="areaDelete(scope.$index, scope.row)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form-item>
                    <el-form-item label="是否开启" prop="isopen">
                        <el-switch
                                v-model="ruleForm.isopen"
                                active-color="#409eff"
                                inactive-color="#dcdfe6">
                        </el-switch>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
                        <el-button type="warning" @click="cancelForm()">取消</el-button>
                    </el-form-item>
                </el-form>
                <el-dialog title="配送区域" :visible.sync="dialogTableVisible" width="70%" :modal-append-to-body="false" class="area-dialog">
                    <div class="area-select">
                        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">全选</el-checkbox>
                        <el-checkbox-group v-model="checkedCities" @change="checkedCitiesChange">
                            <el-checkbox v-for="(city, index) in province" :label="city" :key="index">{{city}}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                    <div class="money-area">
                        <el-form :model="ruleFormTpl" :rules="rulesTpl" ref="ruleFormTpl" label-width="100px" class="demo-ruleForm" label-position="top" v-loading="loading">
                            <el-form-item label="首重（克）" prop="first_weight">
                                <el-input v-model="ruleFormTpl.first_weight" size="small" placeholder="请输入首重（克）"></el-input>
                            </el-form-item>
                            <el-form-item label="首费（元）" prop="first_fee">
                                <el-input v-model="ruleFormTpl.first_fee" size="small" placeholder="请输入首费（元）"></el-input>
                            </el-form-item>
                            <el-form-item label="续重（克）" prop="other_weight">
                                <el-input v-model="ruleFormTpl.other_weight" size="small" placeholder="请输入续重（克）"></el-input>
                            </el-form-item>
                            <el-form-item label="续费（元）" prop="other_fee">
                                <el-input v-model="ruleFormTpl.other_fee" size="small" placeholder="请输入续费（元）"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="submitLogisticForm('ruleFormTpl')">提交</el-button>
                                <el-button type="warning" @click="cancelLogisticForm()">取消</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-dialog>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import {
        Table,
        TableColumn,
        Pagination,
        Input,
        Button,
        Form,
        FormItem,
        Checkbox,
        CheckboxGroup,
        Switch,
        Dialog,
        Message,
        Loading,
        MessageBox
    } from 'element-ui'
    import PageTitle from '../../frame/PageTitle.vue'
    import { checkToken }  from '../../ajax';
    import { aesencode, aesdecode }  from '../../utils';

    Vue.use(Table);
    Vue.use(TableColumn);
    Vue.use(Pagination);
    Vue.use(Input);
    Vue.use(Button);
    Vue.use(Form);
    Vue.use(FormItem);
    Vue.use(Checkbox);
    Vue.use(Switch);
    Vue.use(CheckboxGroup);
    Vue.use(Loading);
    Vue.use(Dialog);
    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$message = Message;

    var province = ['北京市', '天津市', '上海市', '重庆市', '河北省',
        '河南省', '云南省', '辽宁省', '黑龙江省', '湖南省', '安徽省',
        '山东省', '新疆', '江苏省', '浙江省', '江西省', '湖北省',
        '广西', '甘肃省', '山西省', '内蒙古', '陕西省', '吉林省',
        '福建省', '贵州省', '广东省', '青海省', '西藏', '四川省',
        '宁夏', '海南省', '台湾省', '香港', '澳门'
    ];

    export default {
        data(){
            return {
                searchkey: '',
                currentPage: 1,
                loading: false,
                perPage: 10,
                total: 1,
                edit: false,
                activeId: '',
                dialogTableVisible: false,
                editArea: false,
                editAreaIndex: 0,
                multipleSelection: [],

                tableData: [],
                ruleForm: {
                    name: '',
                    isopen: true,
                    send_list:[
                        {
                            isDefault: true,
                            select_all: true,
                            first_weight: 1000,
                            first_fee: 10,
                            other_weight: 1000,
                            other_fee: 8,
                            addr_list: JSON.parse(JSON.stringify(province))
                        }
                    ]
                },
                rules: {
                    name: [
                        { required: true, message: '模板名称', trigger: 'blur' },
                    ]
                },
                province: JSON.parse(JSON.stringify(province)),
                checkAll: false,
                checkedCities: [],
                isIndeterminate: true,
                ruleFormTpl: {
                    first_weight: '1000',
                    first_fee: '10',
                    other_weight: '1000',
                    other_fee: '8'
                },
                rulesTpl: {
                    first_weight: [
                        { required: true, message: '首重（克）', trigger: 'blur' },
                    ],
                    first_fee: [
                        { required: true, message: '首费（元）', trigger: 'blur' },
                    ],
                    other_weight: [
                        { required: true, message: '续重（克）', trigger: 'blur' },
                    ],
                    other_fee: [
                        { required: true, message: '续费（元）', trigger: 'blur' },
                    ]
                }
            }
        },
        methods:{
            handleSizeChange(val) {

            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.lists();
            },
            add(){
                this.edit = true;
                this.activeId = '';
                this.ruleForm.name = '';
                this.ruleForm.isopen = true;
                this.ruleForm.send_list = [
                    {
                        isDefault: true,
                        select_all: true,
                        first_weight: 1000,
                        first_fee: 10,
                        other_weight: 1000,
                        other_fee: 8,
                        addr_list: JSON.parse(JSON.stringify(province))
                    }
                ];
            },
            submitForm(formName) {
                var that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        checkToken(function () {
                            that.loading = true;
                            that.axios.post('/logistics/store', {
                                id: that.activeId,
                                name: that.ruleForm.name,
                                send_list: JSON.stringify(that.ruleForm.send_list),
                                isopen: that.ruleForm.isopen ? 1 : 0,
                                privilege: that.activeId ? encodeURIComponent(aesencode('update')) : encodeURIComponent(aesencode('add'))
                            })
                            .then(function (response) {
                                that.loading = false;
                                Message.success({
                                    message: '保存成功'
                                });

                                that.ruleForm.name = '';
                                that.ruleForm.isopen = true;
                                that.ruleForm.send_list = [
                                    {
                                        isDefault: true,
                                        select_all: true,
                                        first_weight: 1000,
                                        first_fee: 10,
                                        other_weight: 1000,
                                        other_fee: 8,
                                        addr_list: JSON.parse(JSON.stringify(province))
                                    }
                                ];
                                that.cancelForm();
                                that.lists();
                            })
                            .catch(function (error) {
                                that.loading = false;
                                Message.warning({
                                    message: '未知错误'
                                });
                            });
                        });
                    } else {
                        return false;
                    }
                });
            },
            cancelForm(){
                this.edit = false;
            },
            lists(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.axios.get('/logistics/page', {
                        params: { //请求参数
                            page: that.currentPage,
                            num: that.perPage,
                            search: that.searchkey,
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        if (response.data.code == 0) {
                            let lists = response.data.data.data;
                            for(let i=0; i<lists.length; i++){
                                lists[i].send_list = JSON.parse(lists[i].send_list);
                            }
                            that.tableData = lists;
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
                });
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },

            indexMethod(index){
                return index + 1;
            },
            search(){
                this.currentPage = 1;
                this.total = 1;
                this.tableData = [];
                this.lists()
            },
            handleEdit(index, row) {
                this.activeId = row.id;
                this.edit = true;
                this.ruleForm.name = row.name;
                this.ruleForm.send_list = row.send_list;
                this.ruleForm.isopen = row.isopen == 1 ? true : false;
            },
            batchDelete(){
                var that = this;
                if(that.multipleSelection.length <= 0){
                    Message.warning({
                        message: '请选择要删除的选项'
                    });
                    return false;
                }

                that.$prompt('请输入确认密码?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({ value }) => {
                    checkToken(function () {
                        that.loading = true;
                        let idstring = '';
                        for(let i=0; i<that.multipleSelection.length; i++){
                            if(that.multipleSelection[i].id == 2){
                                continue;
                            }

                            if(idstring){
                                idstring += ',' + that.multipleSelection[i].id;
                            }
                            else{
                                idstring = that.multipleSelection[i].id;
                            }
                        }

                        that.axios.post('/logistics/batchdelete', {
                            idstring: idstring,
                            password: encodeURIComponent(aesencode(value)),
                            privilege: encodeURIComponent(aesencode('delete'))
                        })
                        .then(function (response) {
                            that.loading = false;
                            if (response.status = 200 && response.data && response.data.code == 0) {
                                Message.success({
                                    message: '删除成功'
                                });

                                that.currentPage = 1;
                                that.total = 1;
                                that.tableData = [];
                                that.lists();
                            }
                            else{
                                Message.error({
                                    message: response.data.message
                                });
                            }
                        })
                        .catch(function (error) {
                            that.loading = false;
                            Message.warning({
                                message: '删除失败'
                            });
                        });
                    });
                }).catch((error) => {

                });
            },

            addArea(){
                this.dialogTableVisible = true;
                this.ruleFormTpl.first_weight = 1000;
                this.ruleFormTpl.first_fee = 10;
                this.ruleFormTpl.other_weight = 1000;
                this.ruleFormTpl.other_fee = 8;
                this.checkAll = false;
                this.checkedCities = [];
                this.isIndeterminate = true;
                this.editArea = false;
            },
            areaEdit(index, row){
                //循环 ruleForm.send_list
                this.dialogTableVisible = true;
                this.ruleFormTpl.first_weight = row.first_weight;
                this.ruleFormTpl.first_fee = row.first_fee;
                this.ruleFormTpl.other_weight = row.other_weight;
                this.ruleFormTpl.other_fee = row.other_fee;
                this.checkAll = row.select_all;
                this.checkedCities = row.select_all ? JSON.parse(JSON.stringify(province)) : row.addr_list;
                this.isIndeterminate = this.checkedCities.length > 0 && this.checkedCities.length < province.length;
                this.editArea = true;
                this.editAreaIndex = index;
            },
            areaDelete(index, row){
                this.ruleForm.send_list.splice(index, 1);
            },
            checkAllChange(val) {
                this.checkedCities = val ? JSON.parse(JSON.stringify(province)) : [];
                this.isIndeterminate = false;
            },
            checkedCitiesChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.province.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.province.length;
            },
            submitLogisticForm(formName) {
                var that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        that.dialogTableVisible = false;
                        if(that.editArea){
                            that.ruleForm.send_list[that.editAreaIndex].first_weight = that.ruleFormTpl.first_weight;
                            that.ruleForm.send_list[that.editAreaIndex].first_fee = that.ruleFormTpl.first_fee;
                            that.ruleForm.send_list[that.editAreaIndex].other_weight = that.ruleFormTpl.other_weight;
                            that.ruleForm.send_list[that.editAreaIndex].other_fee = that.ruleFormTpl.other_fee;
                            that.ruleForm.send_list[that.editAreaIndex].select_all = that.checkAll;
                            that.ruleForm.send_list[that.editAreaIndex].addr_list = that.checkedCities;
                            that.ruleForm.send_list[that.editAreaIndex].isDefault = false;
                        }
                        else{
                            that.ruleForm.send_list.push({
                                isDefault: false,
                                select_all: that.checkAll,
                                first_weight: that.ruleFormTpl.first_weight,
                                first_fee: that.ruleFormTpl.first_fee,
                                other_weight: that.ruleFormTpl.other_weight,
                                other_fee: that.ruleFormTpl.other_fee,
                                addr_list: that.checkedCities
                            });
                        }
                    }
                    else {
                        return false;
                    }
                });
            },
            cancelLogisticForm(){
                this.editArea = false;
                this.dialogTableVisible = false;
            },
        },
        components: {
            PageTitle
        },
        mounted() {
            this.lists();
        }
    }
</script>
<style scoped="scoped" lang="scss">
    @import '../../../assets/scss/base/mixins';
    @import '../../../assets/scss/base/placeholder';

    .updateWrapper{
        background-color: white;
        border: 1px solid #ebeef5;
        padding: 20px;
    }
    .updateWrapper .title{
        background-color: #f6f8f8;
        font-size: 16px;
        margin: -20px -20px 10px -20px;
        padding: 15px 20px;
        color: #333;
        font-weight: bold;
    }
    .updateWrapper .el-form--label-top .el-form-item__label{
        padding: 0px;
    }

    .add-area{
        position: absolute;
        right: 21px;
        top: -40px;
        width: 100px;
        height: 40px;
    }
    .area-select{
        border-top: 1px solid #dee5e7;
        padding-top: 12px;
        position: relative;
        top: -20px;
    }
    .money-area{
        margin-top: -15px;
    }
    .logistics-page /deep/ .el-checkbox{
        width: 90px;
        margin-bottom: 10px;
    }
    .area-dialog /deep/ .el-form-item{
        margin-bottom: 12px;
    }
    .area-dialog /deep/ .el-form-item__label{
        line-height:30px;
    }
    .area-list-td{
        position: relative;
    }
    .area-list-td span{
        margin-right: 15px;
    }
    .list-tb-td-area span{
        margin-right: 15px;
    }
    .fee-container{
        display:inline-block;
        min-width:360px;
    }
    .text-warning {
        color: #fad733;
    }
    .text-info {
        color: #23b7e5;
    }
</style>