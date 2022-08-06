<template>
    <el-scrollbar ref="scrollbar">
        <Header style="position: fixed; width: 100%; top: 0;"/>
        <div style="margin-top: 74px;"/>
        <div class="tags">
            <el-space wrap>
                <div v-for="tag in tags">
                    <el-button round type="primary" plain @click="selectTag(tag)">
                        {{ tag }}
                    </el-button>
                </div>
            </el-space>
        </div>
        <ToTop @click="toTop"/>
        <ToBottom @click="toBottom"/>
    </el-scrollbar>
</template>

<script setup lang="ts">
import Header from "/src/views/Header.vue";
import ToTop from "/src/views/ToTop.vue";
import ToBottom from "/src/views/ToBottom.vue";
import {ref} from "vue";
import {ElMessage, ElScrollbar} from "element-plus";
import {getRequest} from "/src/utils/api.js"
import {useRouter} from "vue-router";

//获取所有标签
const tags = ref([]);
getRequest("/tag/all").then(res => {
    if (res.data.code === 200) {
        tags.value = res.data.content;
    } else {
        ElMessage.error(res.status +  res.data.message);
    }
});
//点击标签事件处理函数
const router = useRouter();
function selectTag(tag) {
    //路由到TagResult.vue
    router.push("/tagResult/" + tag);
}
//=====================================================================
const scrollbar = ref<InstanceType<typeof ElScrollbar>>();
//回到顶部
function toTop() {
    scrollbar.value.setScrollTop(0);
}
//回到底部
function toBottom() {
    scrollbar.value.setScrollTop(99999);
}
</script>

<style scoped>
.tags {
    padding-top: 3%;
    padding-left: 15%;
    padding-right: 15%;
}
</style>