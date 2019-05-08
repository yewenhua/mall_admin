<template>
    <div class="star-wrapper">
        <div class="start-content" v-for="(item, idnex) in stars">
            <img class="star-image" :style="{left: 0}" :src="point > item ? (point-item == 0.5 ? half_img : selected_img) : normal_img"/>
            <div class="item" :style="{left: 0}"></div>
            <div class="item" :style="{left:  '13px'}"></div>
        </div>
    </div>
</template>
<script>
    export default {
        props: ['point'],
        data(){
            return {
                stars: [0, 1, 2, 3, 4],
                normal_img: require('../../../assets/img/normal.png'),
                selected_img: require('../../../assets/img/selected.png'),
                half_img: require('../../../assets/img/half.png'),
            }
        }
    }
</script>
<style scoped="scoped">
    .star-image {
        position: absolute;
        width: 26px;
        height: 26px;
    }
    .star-wrapper{
        position: relative;
        width: 100%;
        height:100%;
        display: flex;
        align-items: center;
        justify-content: left;
    }
    .star-wrapper .item {
        position: absolute;
        top: 0px;
        width: 13px;
        height: 26px;
        border-bottom:none;
    }
    .start-content{
        position: relative;
        display: inline-block;
        width: 26px;
        height: 26px;
        margin-right: 10px;
    }
</style>