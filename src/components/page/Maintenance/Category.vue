<template>
    <div class="category-page">
        <PageTitle title="商品类目"></PageTitle>
        <div class="agentContent" v-loading="loading">
            <div class="left">
                <el-tree :data="tree" empty-text="暂无数据" :props="defaultProps" ref="tree" node-key="id" default-expand-all highlight-current @node-click="nodeClick"></el-tree>
            </div>
            <div class="right">
                <div class="current">当前分支： {{currnode ? currnode.label : '请选择分支'}}</div>
                <div class="line"></div>
                <div class="operate">
                    <el-button :type="curroperate == 'add' ? 'primary' : 'default'" icon="el-icon-plus" @click="chg('add')">新建子节点</el-button>
                    <el-button :type="curroperate == 'update' ? 'primary' : 'default'" icon="el-icon-edit" @click="chg('update')">修改节点</el-button>
                    <el-button :type="curroperate == 'delete' ? 'primary' : 'default'" icon="el-icon-delete" @click="chg('delete')">删除节点</el-button>
                </div>
                <div class="line"></div>
                <div class="area">
                    <div class="inputWrapper">
                        <div class="title">分支名称</div>
                        <el-input v-model="name" placeholder="请输入分支名称"></el-input>
                    </div>
                    <div class="inputWrapper">
                        <div class="title">导航顺序</div>
                        <el-input v-model="sort" placeholder="请输入导航顺序"></el-input>
                    </div>
                    <div class="inputWrapper">
                        <div class="left">
                            <div class="title">封面图片</div>
                            <el-upload
                                    class="avatar-uploader"
                                    :action="baseURL + 'tree/singlefile'"
                                    :show-file-list="false"
                                    :on-success="handleAvatarSuccess"
                                    :before-upload="beforeAvatarUpload">
                                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                            </el-upload>
                        </div>
                        <div class="right">
                            <div class="title">是否开启</div>
                            <el-switch
                                    v-model="is_open"
                                    active-color="#409eff"
                                    inactive-color="#dcdfe6">
                            </el-switch>
                        </div>
                        <div class="clear"></div>
                    </div>

                    <el-button type="primary" @click="submit">提交</el-button>
                    <br/><br/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import { mapState } from 'vuex'
    import {
        Button,
        Tree,
        Input,
        Message,
        Loading,
        MessageBox,
        Upload,
        Switch
    } from 'element-ui'
    import PageTitle from '../../frame/PageTitle.vue'
    import { checkToken }  from '../../ajax';
    import { aesencode, aesdecode }  from '../../utils';

    Vue.use(Tree);
    Vue.use(Button);
    Vue.use(Input);
    Vue.use(Loading);
    Vue.use(Upload);
    Vue.use(Switch);
    Vue.prototype.$confirm = MessageBox.confirm;
    Vue.prototype.$message = Message;

    export default {
        computed: {
            ...mapState(["domainUrl", 'baseURL']),
        },
        data(){
            return {
                loading: false,
                curroperate: 'add',
                name: '',
                sort: '',
                is_open: true,
                imageUrl: '',
                path: '',
                currnode: null,
                lists: [],
                tree: [],
                defaultProps: {
                    children: 'children',
                    label: 'label'
                }
            }
        },
        methods: {
            getlists(){
                var that = this;
                checkToken(function () {
                    that.loading = true;
                    that.axios.get('/tree/lists', {
                        params: { //请求参数

                        }
                    })
                    .then(function (response) {
                        if (response.data.code == 0) {
                            that.lists = response.data.data.data;
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
                            that.tree = rootArray[0].children;
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
                this.curroperate = 'update';
                this.currnode = node;
                this.name = node.label;
                this.sort = node.sort;
                this.is_open = node.is_open == 1 ? true : false;
                if(node.img_url){
                    this.imageUrl = this.domainUrl + node.img_url;
                }
                else{
                    this.imageUrl = '';
                }
            },
            chg(type){
                if(type == 'add'){
                    this.curroperate = 'add';
                    this.name = '';
                    this.is_open = true;
                    this.sort = '';
                }
                else if(type == 'update'){
                    let node = this.$refs.tree.getCurrentNode();
                    if(node != null){
                        this.curroperate = 'update';
                        this.name = node.label;
                        this.sort = node.sort;
                        this.is_open = node.is_open == 1 ? true : false;
                    }
                    else{
                        Message.warning({
                            message: '请先选择分支'
                        });
                    }
                }
                else if(type == 'delete'){
                    let parentNode = this.$refs.tree.getCurrentNode();
                    if(parentNode != null) {
                        let that = this;
                        that.curroperate = 'delete';
                        that.$confirm('此操作将删除该信息, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            that.remove();
                        }).catch((error) => {

                        });
                    }
                    else{
                        Message.warning({
                            message: '请先选择分支'
                        });
                    }
                }
                else{
                    this.curroperate = 'add';
                }
            },
            append(){
                let that = this;
                if(!this.name){
                    Message.warning({
                        message: '请输入分支名称'
                    });
                    return false;
                }

                if(!this.sort){
                    Message.warning({
                        message: '请输入导航顺序'
                    });
                    return false;
                }

                let newChild = {
                    id: '',
                    label: this.name,
                    sort: this.sort,
                    is_root: 0,
                    children: []
                }

                let parentNode = this.$refs.tree.getCurrentNode();
                if(parentNode != null){
                    let temp = String(parentNode.path);
                    if(temp.split('/').length >= 4){
                        Message.warning({
                            message: '不能再新建子分支了'
                        });
                        return false;
                    }
                    newChild.parent_path = parentNode.path;
                    newChild.is_root = 0;
                }
                else{
                    //没有选中父节点，默认是全部的子节点
                    newChild.is_root = 0;
                    newChild.parent_path = 1;
                }

                if(!that.loading) {
                    checkToken(function () {
                        that.loading = true;
                        that.axios.post('/tree/insert', {
                            label: newChild.label,
                            parent_path: newChild.parent_path,
                            sort: newChild.sort,
                            is_root: newChild.is_root,
                            img_url: that.path,
                            is_open: that.is_open ? 1 : 0,
                            privilege: encodeURIComponent(aesencode('add'))
                        })
                        .then(function (response) {
                            that.loading = false;
                            if (response.data.code == 0) {
                                Message.success({
                                    message: '插入成功'
                                });
                                newChild.id = response.data.data.id;
                                newChild.img_url = that.path;
                                newChild.is_open = that.is_open ? 1 : 0;
                                that.$refs.tree.append(newChild, parentNode);
                            }
                            else {
                                Message.error({
                                    message: response.data.message
                                });
                            }
                        })
                        .catch(function (error) {
                            Message.error({
                                message: '未知错误'
                            });
                            that.loading = false;
                        });
                    });
                }
            },
            remove(){
                let that = this;
                let currnode = this.$refs.tree.getCurrentNode();
                if(currnode) {
                    if(!that.loading) {
                        checkToken(function () {
                            that.loading = true;
                            that.axios.post('/tree/delete', {
                                id: currnode.id,
                                privilege: encodeURIComponent(aesencode('delete'))
                            })
                            .then(function (response) {
                                that.loading = false;
                                if (response.data.code == 0) {
                                    that.$refs.tree.remove(currnode);
                                    that.curroperate = 'add';
                                    Message.success({
                                        message: '操作成功'
                                    });
                                }
                                else {
                                    Message.error({
                                        message: response.data.message
                                    });
                                }
                            })
                            .catch(function (error) {
                                Message.error({
                                    message: '未知错误'
                                });
                                that.loading = false;
                            });
                        });
                    }
                }
                else{
                    Message.warning({
                        message: '请选择节点'
                    });
                }
            },
            update(){
                let that = this;
                if(!that.name){
                    Message.warning({
                        message: '请输入分支名称'
                    });
                    return false;
                }

                if(!that.sort){
                    Message.warning({
                        message: '请输入导航顺序'
                    });
                    return false;
                }

                let currnode = this.$refs.tree.getCurrentNode();
                if(currnode) {
                    if(!that.loading) {
                        checkToken(function () {
                            that.loading = true;
                            that.axios.post('/tree/update', {
                                label: that.name,
                                sort: that.sort,
                                img_url: that.path,
                                is_open: that.is_open ? 1 : 0,
                                id: currnode.id,
                                privilege: encodeURIComponent(aesencode('update'))
                            })
                            .then(function (response) {
                                that.loading = false;
                                if (response.data.code == 0) {
                                    for(let i=0; i<that.tree.length; i++){
                                        //depth 1
                                        if(that.tree[i].id == currnode.id){
                                            that.tree[i].label = that.name;
                                            that.tree[i].sort = that.sort;
                                            that.tree[i].img_url = that.path;
                                            break;
                                        }
                                        for(let j=0; j<that.tree[i].children.length; j++){
                                            //depth 2
                                            if(that.tree[i].children[j].id == currnode.id){
                                                that.tree[i].children[j].label = that.name;
                                                that.tree[i].children[j].sort = that.sort;
                                                that.tree[i].children[j].img_url = that.path;
                                                break;
                                            }
                                            for(let k=0; k<that.tree[i].children[j].children.length; k++){
                                                //depth 3
                                                if(that.tree[i].children[j].children[k].id == currnode.id){
                                                    that.tree[i].children[j].children[k].label = that.name;
                                                    that.tree[i].children[j].children[k].sort = that.sort;
                                                    that.tree[i].children[j].children[k].img_url = that.path;
                                                    break;
                                                }
                                                for(let m=0; m<that.tree[i].children[j].children[k].length; m++){
                                                    //depth 4
                                                    if(that.tree[i].children[j].children[k].children[m].id == currnode.id){
                                                        that.tree[i].children[j].children[k].children[m].label = that.name;
                                                        that.tree[i].children[j].children[k].children[m].sort = that.sort;
                                                        that.tree[i].children[j].children[k].children[m].img_url = that.path;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    };

                                    Message.success({
                                        message: '修改成功'
                                    });
                                }
                                else {
                                    Message.error({
                                        message: response.data.message
                                    });
                                }
                            })
                            .catch(function (error) {
                                Message.error({
                                    message: '未知错误'
                                });
                                that.loading = false;
                            });
                        });
                    }
                }
                else{
                    Message.warning({
                        message: '请选择节点'
                    });
                }
            },
            submit(){
                if(this.curroperate == 'add'){
                    this.append();
                }
                else if(this.curroperate == 'update'){
                    this.update();
                }
                else if(this.curroperate == 'delete'){

                }
            },
            handleAvatarSuccess(res, file) {
                if(res.code == 0){
                    this.path = res.data.path;
                }
                else{
                    this.path = '';
                }
                this.imageUrl = URL.createObjectURL(file.raw);
            },
            beforeAvatarUpload(file) {
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
                const isLt2M = file.size / 1024 / 1024 < 2;

                if (!isJPG) {
                    this.$message.error('上传头像图片只能是 JPG 格式!');
                }
                if (!isLt2M) {
                    this.$message.error('上传头像图片大小不能超过 2MB!');
                }
                return isJPG && isLt2M;
            }
        },
        components: {
            PageTitle
        },
        mounted(){
            this.getlists();
        }
    }
</script>
<style lang="scss" scoped="scoped">
    @import '../../../assets/scss/base/mixins';
    @import '../../../assets/scss/base/placeholder';
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
    .treeLoad{
        @extend %center;
    }
    .current{

    }
    .line {
        @extend %b-b;
        @extend %line;
        @extend %line-lg;
    }
    .inputWrapper{
        @extend %m-b;
    }
    .inputWrapper .title{
        @extend %m-b-sm;
    }
    .inputWrapper .left{
        @extend %left;
        width: 50%;
    }
    .inputWrapper .right{
        @extend %left;
        width: 50%;
    }
    .category-page /deep/ .el-tree-node__content{
        padding-top: 3px;
        padding-bottom: 3px;
    }
    .category-page /deep/ .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
        background-color: #23b7e5;
        color: white;
    }
    .category-page /deep/ .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        background: white;
    }
    .category-page /deep/ .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
    }
    .category-page /deep/ .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }
    .category-page /deep/ .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
</style>