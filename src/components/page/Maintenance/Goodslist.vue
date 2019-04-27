<template>
    <div class="gslist-page">
        <PageTitle title="商品列表"></PageTitle>
        <div class="agentContent" v-loading="loading">
            <div class="left">
                <el-tree :data="tree" empty-text="暂无数据" :props="defaultProps" ref="tree" node-key="id" default-expand-all highlight-current @node-click="nodeClick"></el-tree>
            </div>
            <div class="right">
                <div class="lookWrapper" v-show="!edit">
                    <div class="searchWrapper">
                        <el-input placeholder="请输入内容" v-model="searchkey" size="medium">
                            <el-button slot="append" size="medium" icon="el-icon-search" @click="search">搜索</el-button>
                        </el-input>
                        <el-button type="primary" size="medium" class="addBtn" icon="el-icon-plus" @click="add" v-if="hasPermission('admin/goodslist', 'add')">添加</el-button>
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
                                type="selection"
                                align="center"
                                width="40">
                        </el-table-column>
                        <el-table-column
                                type="index"
                                align="center"
                                width="30"
                                :index="indexMethod">
                        </el-table-column>
                        <el-table-column
                                prop="name"
                                align="center"
                                label="商品标题">
                        </el-table-column>
                        <el-table-column
                                prop="sale_price"
                                align="center"
                                label="商品价格">
                        </el-table-column>
                        <el-table-column
                                align="center"
                                prop="defaultImage"
                                label="商品主图">
                            <template slot-scope="scope">
                                <el-popover
                                        placement="left"
                                        width="400"
                                        trigger="click">
                                    <img class="pop_img" :src="scope.row.mainpic[0].url"/>
                                    <img class="face_img" :src="scope.row.mainpic[0].url" slot="reference"/>
                                </el-popover>
                            </template>
                        </el-table-column>
                        <el-table-column
                                prop="is_release"
                                align="center"
                                width="80"
                                label="商品状态">
                            <template slot-scope="scope">
                                <div class="status" :class="scope.row.is_release ? 'active' : 'unactive'">{{scope.row.is_release ? '上架' : '下架'}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column
                                align="center"
                                prop="created_at"
                                width="100"
                                label="创建时间">
                            <template slot-scope="scope">
                                <div>{{scope.row.created_at ? scope.row.created_at.substring(0, 10) : ''}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="上下架" align="center" width="70">
                            <template slot-scope="scope">
                                <el-switch
                                        v-model="scope.row.is_release"
                                        @change="updown(scope.row)">
                                </el-switch>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center" width="80">
                            <template slot-scope="scope">
                                <el-button
                                        size="mini"
                                        type="primary"
                                        @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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
                </div>

                <div class="updateWrapper device" v-show="edit">
                    <div class="title">请填写以下信息</div>
                    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" label-position="top" v-loading="loading">
                        <el-form-item label="商品标题" prop="name">
                            <el-input v-model="ruleForm.name" placeholder="请输入商品标题"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="sale_price">
                            <el-input v-model="ruleForm.sale_price" placeholder="请输入商品价格"></el-input>
                        </el-form-item>
                        <el-form-item label="商品主图" prop="mainpic">
                            <el-upload
                                    :action="baseURL + 'goods/singlefile'"
                                    name="file"
                                    :headers="{Authorization: `Bearer ${token.value}`}"
                                    :data="{imageType: 'GOODS_IMAGE', privilege: uploadPriviledge(), path: uploadPath()}"
                                    list-type="picture-card"
                                    :file-list="ruleForm.mainpic"
                                    :on-preview="handlePictureCardPreview"
                                    :on-success="handleMainSuccess"
                                    :before-upload="beforeAvatarUpload"
                                    :on-remove="handleMainRemove">
                                <i class="el-icon-plus"></i>
                            </el-upload>
                            <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false">
                                <img width="100%" :src="dialogImageUrl" alt="">
                            </el-dialog>
                        </el-form-item>
                        <el-form-item label="商品规格" prop="properties">
                            <div class="add-child" v-if="ruleForm.properties.length <= 1">
                                <el-button size="mini" icon="el-icon-plus" @click="addOption">商品属性</el-button>
                            </div>
                            <div class="child-item" v-for="(child, pidx) in ruleForm.properties" :key="pidx">
                                <div class="sku-color sku-item">
                                    <input v-model="child.title" placeholder="请输入商品属性"></input>
                                    <span class="sku-add" @click="addProperty(pidx)">+</span>
                                    <i class="el-icon-circle-close sku-close" @click="deleteOption(pidx)"></i>
                                </div>
                                <div class="sku-color" v-for="(item, cidx) in child.list" :key="cidx">
                                    <input v-model="item.name" placeholder="请输入子选项"></input>
                                    <i class="el-icon-circle-close sku-close" @click="delProperty(pidx, cidx)"></i>
                                </div>
                            </div>

                            <el-table
                                    v-if="skuList.length > 0"
                                    :data="skuList"
                                    border
                                    class="sku-tb">
                                <el-table-column
                                        prop="first_properties"
                                        :label="skuList[0].first_properties_title">
                                </el-table-column>
                                <el-table-column
                                        v-if="skuList[0].second_properties_title"
                                        prop="second_properties"
                                        :label="skuList[0].second_properties_title">
                                </el-table-column>
                                <el-table-column
                                        prop="num"
                                        label="库存">
                                    <template slot-scope="scope">
                                        <div><el-input v-model="scope.row.num" placeholder="请输入库存" size="mini" type="number" class="sku-num"></el-input></div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form-item>
                        <el-form-item label="商品详情" prop="detailpic">
                            <el-upload
                                    :action="baseURL + 'goods/singlefile'"
                                    name="file"
                                    :headers="{Authorization: `Bearer ${token.value}`}"
                                    :data="{imageType: 'GOODS_DETAIL', privilege: uploadPriviledge(), path: uploadPath()}"
                                    list-type="picture-card"
                                    :file-list="ruleForm.detailpic"
                                    :on-preview="handlePictureCardPreview"
                                    :on-success="handleDetailSuccess"
                                    :before-upload="beforeAvatarUpload"
                                    :on-remove="handleDetailRemove">
                                <i class="el-icon-plus"></i>
                            </el-upload>
                            <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false">
                                <img width="100%" :src="dialogImageUrl" alt="">
                            </el-dialog>
                        </el-form-item>
                        <el-form-item label="配送方式" prop="send_type">
                            <el-select v-model="ruleForm.send_method" placeholder="配送方式" size="medium" style="width: 100%;">
                                <el-option
                                        v-for="item in logisticData"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="是否上架" prop="is_release">
                            <el-switch
                                    v-model="ruleForm.is_release"
                                    active-color="#409eff"
                                    inactive-color="#dcdfe6">
                            </el-switch>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
                            <el-button type="warning" @click="cancel()">取消</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import { mapState } from 'vuex'
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
        Popover,
        Select,
        Option,
        Switch,
        Checkbox,
        CheckboxButton,
        CheckboxGroup,
        Dialog,
        Upload,
        Tree
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
    Vue.use(Loading);
    Vue.use(Select);
    Vue.use(Option);
    Vue.use(Switch);
    Vue.use(Checkbox);
    Vue.use(CheckboxButton);
    Vue.use(CheckboxGroup);
    Vue.use(Dialog);
    Vue.use(Upload);
    Vue.use(Popover);
    Vue.use(Tree);
    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$message = Message;

    export default {
        computed: {
            ...mapState(["domainUrl", 'baseURL', 'userInfo', 'token']),
            skuList(){
                let arr = [];
                if(this.ruleForm.properties.length > 0){
                    if(this.ruleForm.properties.length == 1 && this.ruleForm.properties[0].list.length > 0) {
                        //只有单个规格
                        let children = this.ruleForm.properties[0].list;
                        for(let i=0; i<children.length; i++) {
                            if (children[i].name) {
                                let num = 0;
                                if(this.edit && this.activeData){
                                    for(let i=0; i<this.activeData.skus.length; i++){
                                        if(this.activeData.skus[i].first_properties_id == children[i].attr_id){
                                            num = this.activeData.skus[i].num;
                                        }
                                    }
                                }

                                arr.push({
                                    first_properties: children[i].name,
                                    first_properties_title: this.ruleForm.properties[0].title,
                                    second_properties: '',
                                    second_properties_title: '',
                                    num: num
                                });
                            }
                        }
                    }
                    else if(this.ruleForm.properties.length == 2 && this.ruleForm.properties[0].list.length > 0 && this.ruleForm.properties[1].list.length > 0){
                        //2个规格
                        let firstChildren = this.ruleForm.properties[0].list;
                        let secondChildren = this.ruleForm.properties[1].list;
                        for(let i=0; i<firstChildren.length; i++) {
                            for (let j = 0; j < secondChildren.length; j++) {
                                if (firstChildren[i].name && secondChildren[j].name) {
                                    let num = 0;
                                    if(this.edit && this.activeData){
                                        for(let k=0; k<this.activeData.skus.length; k++){
                                            if(this.activeData.skus[k].first_properties_id == firstChildren[i].attr_id && this.activeData.skus[k].second_properties_id == secondChildren[j].attr_id){
                                                num = this.activeData.skus[k].num;
                                            }
                                        }
                                    }

                                    arr.push({
                                        first_properties: firstChildren[i].name,
                                        first_properties_title: this.ruleForm.properties[0].title,
                                        second_properties: secondChildren[j].name,
                                        second_properties_title: this.ruleForm.properties[1].title,
                                        num: num
                                    });
                                }
                            }
                        }
                    }
                }
                return arr;
            }
        },
        data(){
            return {
                currentPage: 1,
                perPage: 10,
                total: 1,
                searchkey: '',
                isActive: 'all',
                loading: false,
                edit: false,
                activeId: '',
                activeData: null,
                tableData: [],
                multipleSelection: [],
                ruleForm: {
                    name: '',
                    sale_price: '',
                    send_method: '',
                    mainpic: [],
                    detailpic: [],
                    properties:[{
                        title: '',
                        list: [{
                            name: '',
                            attr_id: '' //新增时为空，编辑时获取sku数量用
                        }]
                    }],
                    is_release: true
                },
                rules: {
                    name: [
                        { required: true, message: '请输入商品标题', trigger: 'blur' }
                    ],
                    send_method: [
                        { required: true, message: '请输入配送方式', trigger: 'blur' }
                    ],
                    sale_price: [
                        { required: true, message: '请输入商品价格', trigger: 'blur' }
                    ],
                    mainpic: [
                        { required: true, message: '请商品主图', trigger: 'blur' }
                    ],
                    detailpic: [
                        { required: true, message: '请上传商品详情图', trigger: 'blur' }
                    ]
                },
                dialogImageUrl: '',
                dialogVisible: false,
                logisticData: [],
                path: '',
                currnode: null,
                tree: [],
                defaultProps: {
                    children: 'children',
                    label: 'label'
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
            uploadPriviledge(){
                return encodeURIComponent(aesencode('update'));
            },
            uploadPath(){
                let path = this.$router.currentRoute.fullPath.substring(1);
                return encodeURIComponent(aesencode(path))
            },
            add(){
                this.edit = true;
                this.activeId = '';
                this.ruleForm.name = '';
                this.ruleForm.send_method = '';
                this.ruleForm.sale_price = '';
                this.ruleForm.properties = [{
                    title: '',
                    list: [{
                        name: '',
                        num: 0,
                        attr_id: ''
                    }]
                }];
                this.ruleForm.mainpic = [];
                this.ruleForm.detailpic = [];
                this.ruleForm.is_release = true;
            },
            submitForm(formName) {
                var that = this;
                let flag = false;
                let images = '';
                let detailImages = '';

                if(!that.currnode){
                    Message.warning({
                        message: '请选择商品类目'
                    });
                    return false;
                }

                for(let i=0; i<that.ruleForm.properties.length; i++){
                    if(that.ruleForm.properties[i].title){
                        flag = true;
                        break;
                    }
                }

                if(that.ruleForm.mainpic.length <= 0){
                    Message.warning({
                        message: '请上传商品主图'
                    });
                    return false;
                }
                else{
                    for(let i=0; i<that.ruleForm.mainpic.length; i++){
                        if(images){
                            images = images + ',' + that.ruleForm.mainpic[i].name;
                        }
                        else{
                            images = that.ruleForm.mainpic[i].name;
                        }
                    }
                }

                if(that.ruleForm.detailpic.length <= 0){
                    Message.warning({
                        message: '请上传商品详情图'
                    });
                    return false;
                }
                else{
                    for(let i=0; i<that.ruleForm.detailpic.length; i++){
                        if(detailImages){
                            detailImages = detailImages + ',' + that.ruleForm.detailpic[i].name;
                        }
                        else{
                            detailImages = that.ruleForm.detailpic[i].name;
                        }
                    }
                }

                if(!that.ruleForm.send_method){
                    Message.warning({
                        message: '请选择配送方式'
                    });
                    return false;
                }

                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        that.loading = true;
                        that.axios.post('/goods/store', {
                            id: that.activeId,
                            category: this.currnode.path,
                            name: that.ruleForm.name,
                            sku: JSON.stringify(that.skuList),
                            properties: JSON.stringify(that.ruleForm.properties),
                            sale_price: that.ruleForm.sale_price,
                            send_method: that.ruleForm.send_method,
                            images: images,
                            detailImages: detailImages,
                            isSku: flag,
                            is_release: that.ruleForm.is_release,
                            privilege: encodeURIComponent(aesencode('update'))
                        })
                        .then(function (response) {
                            that.loading = false;
                            if (response.data.code == 0) {
                                Message.success({
                                    message: '操作成功'
                                });

                                that.ruleForm.name = '';
                                that.ruleForm.sale_price = '';
                                that.ruleForm.properties = [{
                                    title: '',
                                    list: [{
                                        name: '',
                                        num: 0,
                                        attr_id: ''
                                    }]
                                }];
                                that.ruleForm.mainpic = [];
                                that.ruleForm.detailpic = [];
                                that.ruleForm.is_release = true;
                                that.cancel();
                                that.lists();
                            }
                            else{
                                Message.warning({
                                    message: response.data.message
                                });
                            }
                        })
                        .catch(function (error) {
                            that.loading = false;
                            Message.warning({
                                message: '未知错误'
                            });
                        });
                    } else {
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            search(){
                this.currentPage = 1;
                this.total = 1;
                this.tableData = [];
                this.lists();
            },
            lists(){
                var that = this;
                checkToken (() => {
                    that.loading = true;
                    that.axios.get('/goods/page', {
                        params: { //请求参数
                            category: this.currnode ? this.currnode.path : '',
                            num: that.perPage,
                            page: that.currentPage,
                            search: that.searchkey,
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        if (response.data.code == 0) {
                            let lists = response.data.data.data;
                            for (let i = 0; i < lists.length; i++) {
                                let mainArr = [];
                                let detailArr = [];
                                for (let j = 0; j < lists[i].images.length; j++) {
                                    if (lists[i].images[j].type == 'main') {
                                        mainArr.push({
                                            name: lists[i].images[j].url,
                                            url: that.getImg(lists[i].images[j].url)
                                        });
                                    }
                                    else if (lists[i].images[j].type == 'detail') {
                                        detailArr.push({
                                            name: lists[i].images[j].url,
                                            url: that.getImg(lists[i].images[j].url)
                                        });
                                    }
                                }

                                lists[i].mainpic = mainArr;
                                lists[i].detailpic = detailArr;
                                lists[i].is_release = lists[i].is_release == 1 ? true : false;
                            }
                            that.tableData = lists;
                            that.total = response.data.data.total;
                        }
                        else {
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
                });
            },
            logistics(){
                var that = this;
                checkToken (() => {
                    that.axios.get('/logistics/lists', {
                        params: { //请求参数
                            privilege: encodeURIComponent(aesencode('read'))
                        }
                    })
                    .then(function (response) {
                        if (response.data.code == 0) {
                            let lists = response.data.data;
                            that.logisticData = lists;
                        }
                        else {
                            Message.warning({
                                message: response.data.message
                            });
                        }
                    })
                    .catch(function (error) {
                        Message.error({
                            message: '未知错误'
                        });
                    });
                });
            },
            updown(row){
                var that = this;
                that.loading = true;
                let url = '';
                if(row.isMarketable){
                    url = '/admin/goods/up/' + row.idstr;
                }
                else{
                    url = '/admin/goods/down/' + row.idstr;
                }

                that.axios.post(url, {
                    id: row.idstr
                })
                .then(function (response) {
                    if (response.data.code == 0) {
                        Message.success({
                            message: '操作成功'
                        });
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
            cancel(){
                this.edit = false;
            },
            indexMethod(index){
                return index + 1;
            },

            setTreeIdByPath(path){
                let id;
                let flag = false;
                for(let i=0; i<this.tree.length; i++){
                    if(this.tree[i].path == path){
                        id = this.tree[i].id;
                        flag = true;
                        break;
                    }

                    if(!flag && this.tree[i].children.length > 0){
                        //进入子循环
                        for(let j=0; j<this.tree[i].children.length; j++){
                            if(this.tree[i].children[j].path == path){
                                id = this.tree[i].children[j].id;
                                flag = true;
                                break;
                            }

                            if(!flag && this.tree[i].children[j].children.length > 0){
                                //进入子循环
                                for(let k=0; k<this.tree[i].children[j].children.length; k++){
                                    if(this.tree[i].children[j].children[k].path == path){
                                        id = this.tree[i].children[j].children[k].id;
                                        flag = true;
                                        break;
                                    }

                                    if(!flag && this.tree[i].children[j].children[k].children.length > 0){
                                        //循环到最后,进入子循环
                                        for(let l=0; l<this.tree[i].children[j].children[k].children.length; l++){
                                            if(this.tree[i].children[j].children[k].children[l].path == path){
                                                id = this.tree[i].children[j].children[k].children[l].id;
                                                flag = true;
                                                break;
                                            }

                                            if(!flag && l == this.tree[i].children[j].children[k].children[l].children.length > 0){
                                                //循环到最后,进入子循环
                                                for(let m=0; m<this.tree[i].children[j].children[k].children[l].children.length; m++){
                                                    if(this.tree[i].children[j].children[k].children[l].children[m].path == path){
                                                        id = this.tree[i].children[j].children[k].children[l].children[m].id;
                                                        flag = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if(id){
                    this.$refs.tree.setCheckedKeys([id]);
                    this.$refs.tree.setCurrentKey(id);
                    this.currnode = this.$refs.tree.getCurrentNode();
                }
            },
            in_array(arr, val){
                let flag = false;
                for(let i=0; i<arr.length; i++){
                    if(val == arr[i].name){
                        flag = true;
                        break;
                    }
                }

                return flag;
            },
            handleEdit(index, row) {
                let that = this;
                that.activeId = row.idstr;
                that.activeData = row;
                that.edit = true;

                that.setTreeIdByPath(row.category);
                let properties_arr;
                if(row.is_sku && row.skus.length > 0) {
                    //生成属性列表
                    let skus = row.skus;
                    properties_arr = [
                        {
                            title: skus[0].first_property.title,
                            list: []
                        }
                    ];

                    if (skus[0].second_properties_id) {
                        properties_arr.push({
                            title: skus[0].second_property.title,
                            list: []
                        });
                    }

                    for (let i = 0; i < skus.length; i++) {
                        if(!that.in_array(properties_arr[0].list, skus[i].first_property.name)) {
                            properties_arr[0].list.push({
                                name: skus[i].first_property.name,
                                attr_id: skus[i].first_properties_id
                            });
                        }

                        if (skus[i].second_properties_id) {
                            if(!that.in_array(properties_arr[1].list, skus[i].second_property.name)) {
                                properties_arr[1].list.push({
                                    name: skus[i].second_property.name,
                                    attr_id: skus[i].second_properties_id
                                });
                            }
                        }
                    }
                }

                that.ruleForm.name = row.name;
                that.ruleForm.send_method = row.send_method;
                that.ruleForm.sale_price = row.sale_price;
                that.ruleForm.properties = properties_arr;
                that.ruleForm.mainpic = row.mainpic;
                that.ruleForm.detailpic = row.detailpic;
                that.ruleForm.is_release = row.is_release;
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            handleMainRemove(file, fileList) {
                let that = this;
                that.loading = true;
                that.axios.post('/admin/goods/deleteImg', {
                    goodsId: that.activeId,
                    imageName: file.name,
                    imageType: 'GOODS_IMAGE'
                })
                    .then(function (response) {
                        that.loading = false;
                        if(response.data.code == 0) {
                            Message.success({
                                message: '操作成功'
                            });

                            let idx = -1;
                            let mainpic = that.ruleForm.mainpic;
                            for(let i=0; i<that.ruleForm.mainpic.length; i++){
                                if(that.ruleForm.mainpic[i].name == file.name){
                                    idx = i;
                                }
                            }
                            if (idx !== -1) {
                                mainpic.splice(idx, 1);
                                that.ruleForm.mainpic = mainpic;
                            }
                        }
                        else{
                            Message.warning({
                                message: response.data.message
                            });
                        }
                    })
                    .catch(function (error) {
                        that.loading = false;
                        Message.warning({
                            message: '未知错误'
                        });
                    });
            },
            handleDetailRemove(file, fileList) {
                let that = this;
                that.loading = true;
                that.axios.post('/admin/goods/deleteImg', {
                    goodsId: that.activeId,
                    imageName: file.name,
                    imageType: 'GOODS_DETAIL'
                })
                    .then(function (response) {
                        that.loading = false;
                        if(response.data.code == 0) {
                            Message.success({
                                message: '操作成功'
                            });

                            let idx = -1;
                            let detailpic = that.ruleForm.detailpic;
                            for(let i=0; i<that.ruleForm.detailpic.length; i++){
                                if(that.ruleForm.detailpic[i].name == file.name){
                                    idx = i;
                                }
                            }
                            if (idx !== -1) {
                                detailpic.splice(idx, 1);
                                that.ruleForm.detailpic = detailpic;
                            }
                        }
                        else{
                            Message.warning({
                                message: response.data.message
                            });
                        }
                    })
                    .catch(function (error) {
                        that.loading = false;
                        Message.warning({
                            message: '未知错误'
                        });
                    });
            },
            handlePictureCardPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
            },
            handleMainSuccess(res, file) {
                var that = this;
                if(res.code == 0){
                    let mainpic = that.ruleForm.mainpic;
                    mainpic.push({
                        name: res.data.path,
                        url: that.getImg(res.data.path)
                    });
                    that.ruleForm.mainpic = mainpic;
                }
            },
            handleDetailSuccess(res, file) {
                var that = this;
                if(res.code == 0){
                    let detailpic = that.ruleForm.detailpic;
                    detailpic.push({
                        name: res.data.path,
                        url: that.getImg(res.data.path)
                    });
                    that.ruleForm.detailpic = detailpic;
                }
            },
            beforeAvatarUpload(file) {
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
                const isLt10M = file.size / 1024 / 1024 < 10;

                if (!isJPG) {
                    this.$message.error('上传头像图片只能是 jpg、jpeg、png 格式!');
                }
                if (!isLt10M) {
                    this.$message.error('上传头像图片大小不能超过 10MB!');
                }
                return isJPG && isLt10M;
            },
            addOption(){
                if(this.ruleForm.properties.length <= 1) {
                    this.ruleForm.properties.push({
                        title: '',
                        list: [{
                            name: '',
                            num: 0,
                            attr_id: ''
                        }]
                    });
                }
            },
            deleteOption(idx){
                this.ruleForm.properties.splice(idx, 1);
            },
            addProperty(idx){
                this.ruleForm.properties[idx].list.push({
                    name: '',
                    num: 0,
                    attr_id: ''
                });
            },
            delProperty(pidx, cidx){
                this.ruleForm.properties[pidx].list.splice(cidx, 1);
            },
            getImg(img){
                return this.domainUrl + img
            },
            getTree(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.axios.get('/tree/lists', {
                        params: { //请求参数

                        }
                    })
                    .then(function (response) {
                        if (response.data.code == 0) {
                            var originalData = response.data.data.data;
                            var rootArray = [];

                            //depth = 1
                            originalData.map((value, key) => {
                                value.children = [];
                                if(value.is_root == 1){
                                    rootArray.push(value);
                                }
                            });

                            //depth = 2
                            for(var i=0; i<rootArray.length; i++){
                                originalData.map((value, key) => {
                                    if(value.is_root != 1){
                                        var tempPath = value.path.split('/');
                                        if(tempPath.length == 2 && tempPath[0] == rootArray[i].path){
                                            rootArray[i].children.push(value);
                                        }
                                    }
                                });
                            }

                            //depth = 3
                            for(var i=0; i<rootArray.length; i++){
                                originalData.map((value, key) => {
                                    var tempPath = value.path.split('/');
                                    if(value.is_root != 1 && tempPath.length == 3){
                                        if(rootArray[i].children.length > 0){
                                            for(var j=0; j<rootArray[i].children.length; j++){
                                                var tempParentPath = rootArray[i].children[j].path.split('/');
                                                var pathString = tempPath[0] + tempPath[1];
                                                var parentPathString = tempParentPath[0] + tempParentPath[1];
                                                if(pathString == parentPathString){
                                                    rootArray[i].children[j].children.push(value);
                                                }
                                            }
                                        }
                                    }
                                });
                            }

                            //depth = 4
                            for(var i=0; i<rootArray.length; i++){
                                originalData.map((value, key) => {
                                    var tempPath = value.path.split('/');
                                    if(value.is_root != 1 && tempPath.length == 4){
                                        if(rootArray[i].children.length > 0){
                                            for(var j=0; j<rootArray[i].children.length; j++){
                                                if(rootArray[i].children[j].children.length > 0){
                                                    for(var k=0; k<rootArray[i].children[j].children.length; k++){
                                                        var tempParentPath = rootArray[i].children[j].children[k].path.split('/');
                                                        var pathString = tempPath[0] + tempPath[1] + tempPath[2];
                                                        var parentPathString = tempParentPath[0] + tempParentPath[1] + tempParentPath[2];
                                                        if(pathString == parentPathString){
                                                            rootArray[i].children[j].children[k].children.push(value);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                            }

                            //that.tree = rootArray[0].children; //没有全部
                            that.tree = rootArray; //全部
                            that.lists();

                            //选中根节点
                            that.$nextTick(() => {
                                that.setTreeIdByPath(that.tree[0].path);
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
                });
            },
            nodeClick(node){
                this.currnode = node;
                this.searchkey = '';
                if(!this.edit){
                    this.lists();
                }
            },
        },
        components: {
            PageTitle
        },
        mounted() {
            this.getTree();
            this.logistics();
        }
    }
</script>
<style scoped="scoped">
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
    .el-form-item__content .edui-toolbar{
        line-height: normal;
    }
    .status.active{
        color: green;
    }
    .status.unactive{
        color: red;
    }
    .device .el-form-item {
        margin-bottom: 10px;
    }
    .device{
        position: relative;
    }
    .sku-color{
        margin-right: 8px;
        height: 35px;
        display: inline-block;
        position: relative;
        margin-top: 10px;
    }
    .sku-color input{
        width: 115px;
        border: none;
        outline: 0;
        height: 35px;
        line-height: 35px;
        float: left;
        display: inline-block;
        border: 1px solid #dcdfe6;
        box-sizing: border-box;
        padding-left: 15px;
        border-bottom-left-radius: 3px;
        border-top-left-radius: 3px;
    }
    .sku-item{
        display: block;
    }
    .sku-color.sku-item input{
        border-right: none;
    }
    .sku-add{
        height: 35px;
        line-height: 35px;
        background: #67c23a;
        color: white;
        width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        display: inline-block;
        text-align: center;
        cursor: pointer;
        float: left;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
    }
    .sku-close{
        position: absolute;
        right: -10px;
        top: -10px;
        color: #f56c6c;
        font-size: 20px;
        display: none;
        cursor: pointer;
    }
    .sku-color:hover .sku-close{
        display: block;
    }
    .sku-color.sku-item .sku-close{
        left: 148px;
    }
    .add-child{
        position: absolute;
        left: 80px;
        top: -40px;
        font-size: 14px;
    }
    .child-item{
        padding: 6px 15px;
        border: 1px solid #cfdadd;
        margin-top: 8px;
        border-radius: 3px;
    }
    .sku-tb{
        width: 100%;
        margin-top: 12px;
    }
    .sku-num{
        width: 200px;
    }
    .gslist-page /deep/ .el-table td, .el-table th{
        padding: 5px 0px;
    }

    .agentContent{
        height: calc( 100% - 80px );
        width: 100%;
        display: flex;
        flex-direction: row;
        position: relative;
    }
    .agentContent > .left{
        width: 280px;
        height: 100%;
        overflow: auto;
        box-sizing: border-box;
        padding: 20px;
        border-right: 1px solid #e6e6e6;
    }
    .agentContent > .right{
        flex: 1;
        height: 100%;
        overflow: auto;
        box-sizing: border-box;
        padding: 20px;
    }
    .agentContent .left .el-tree{
        background-color: #edf1f2;
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .gslist-page /deep/ .el-tree-node__content{
        padding-top: 3px;
        padding-bottom: 3px;
    }
    .gslist-page /deep/ .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
        background-color: #23b7e5;
        color: white;
    }
    .pop_img{
        width: 400px;
    }
    .face_img{
        height: 60px;
    }
</style>