<template>
    <el-scrollbar ref="scrollbar">
        <Header style="position: fixed; width: 100%; top: 0;"/>
        <div style="margin-top: 74px;"/>
        <div v-for="summary in summaries" class="card">
            <el-card>
                <template #header>
                    <div class="card-header">
                        <h1 class="card-header-title" @click="readMore(summary.articleId, summary)">
                            {{ summary.title }}
                        </h1>
                        <span>
                            <el-button text bg type="primary" @click="readMore(summary.articleId, summary)">
                                阅读更多
                            </el-button>
                        </span>
                    </div>
                    <div class="tag">
                        <div class="tag-span">
                            <DateIcon class="tag-span-icon"/>
                            <div class="tag-span-text">
                                <el-tag size="small" effect="plain">
                                    {{ summary.firstReleaseDate }}
                                </el-tag>
                            </div>
                        </div>
                        <div class="tag-span">
                            <CategoryIcon class="tag-span-icon-2"/>
                            <div class="tag-span-text">
                                <el-tag size="small" effect="plain">
                                    {{ summary.classification }}
                                </el-tag>
                            </div>
                        </div>
                        <div class="tag-span">
                            <TagIcon class="tag-span-icon"/>&nbsp;&nbsp;
                            <div v-for="tagName in summary.tags">
                                <el-tag size="small" effect="plain">
                                    {{ tagName }}
                                </el-tag>&nbsp;
                            </div>
                        </div>
                    </div>
                </template>
                <div v-html="summary.summary"/>
            </el-card>
        </div>
        <el-pagination
            v-model:currentPage="currentPage"
            v-model:page-size="itemSize"
            background
            layout="prev, pager, next, jumper"
            :total="total"
            @current-change="changePage"
            class="pagination"
        />
        <ToTop @click="toTop"/>
        <ToBottom @click="toBottom"/>
    </el-scrollbar>
</template>

<script setup lang="ts">
import Header from "/src/views/Header.vue";
import {ref} from "vue";
import {postRequest} from "/src/utils/api.js";
import {ElMessage, ElScrollbar} from "element-plus";
import ToTop from "../views/ToTop.vue";
import ToBottom from "../views/ToBottom.vue";
import DateIcon from "../assets/DateIcon.vue";
import CategoryIcon from "../assets/CategoryIcon.vue";
import TagIcon from "../assets/TagIcon.vue";
import {useRoute, useRouter} from "vue-router";

//从路由中获取参数tagName
const route = useRoute();
const categoryName = route.params.categoryName;
//摘要总数
const total = ref(0);
//每一页摘要的数量
const itemSize = ref(5);
//摘要VO
const summaries = ref({
    articleId: String,
    firstReleaseDate: String,
    lastModifiedTime: String,
    classification: String,
    tags: [],
    title: String,
    summary: String,
}[itemSize.value]);
//根据tagName获取摘要总数和第一页的内容
postRequest("/category/summaryWithCategory/" + categoryName + "/of/1", null).then(res => {
    if (res.data.code === 200) {
        //得到第一页的摘要数据（VO）
        total.value = Number(res.data.message);
        summaries.value = res.data.content;
        //将当前页的摘要缓存到sessionStorage
        const cachedSummaries = JSON.stringify(summaries.value);
        window.sessionStorage.setItem("category_result_of_" + categoryName + "_index_1", cachedSummaries);
    } else {
        ElMessage.error("未能从后台服务器获取到数据");
    }
});
//当前页索引
const currentPage = ref(1);
const scrollbar = ref<InstanceType<typeof ElScrollbar>>();
//更改当前页
const changePage = (pageIndex: number) => {
    const prefix = "category_result_of_" + categoryName + "_index_";
    const cache = window.sessionStorage.getItem(prefix + pageIndex);
    //检查当前页是否有缓存
    if (cache) {
        //有缓存则从缓存获取
        summaries.value = JSON.parse(cache);
        //回到页顶
        scrollbar.value.setScrollTop(0);
    } else {
        //没缓存则从后台获取
        postRequest("/category/summaryWithCategory/" + categoryName + "/of/" + pageIndex, null).then(res => {
            if (res.data.code === 200) {
                //更新数据
                summaries.value = res.data.content;
                //回到页顶
                scrollbar.value.setScrollTop(0);
                //将当前页的摘要缓存到sessionStorage
                const cachedSummaries = JSON.stringify(summaries.value);
                window.sessionStorage.setItem(prefix + pageIndex, cachedSummaries);
            } else {
                ElMessage.error("未能从后台服务器获取到数据");
            }
        })
    }
}
//======================================================================
const router = useRouter();
//阅读更多处理函数
function readMore(id, summaryData) {
    //将被选中的文章摘要缓存至sessionStorage以便在Article.vue中获取该值
    const summaryString = JSON.stringify(summaryData);
    window.sessionStorage.setItem("summary", summaryString);
    //路由到Article.vue
    router.push("/article/" + id);
}
//======================================================================
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
.card {
    padding-left: 15%;
    padding-right: 15%;
    display: block;
    margin-bottom: 15px;
}

.card-header {
    display: flex;
    height: 20px;
    justify-content: space-between;
    align-items: center;
}

.card-header-title {
    background-image: linear-gradient(135deg, #81FFEF 10%, #F067B4 100%);
    -webkit-background-clip: text;
    color: transparent;
    margin: 0;
    padding-bottom: 0;
}

.card-header-title:hover {
    cursor:pointer;
}

.tag {
    display: flex;
    margin-top: 18px;
    margin-bottom: 0;
}

.tag-span {
    display: flex;
    font-size: small;
    margin-right: 10px;
}

.tag-span-icon {
    width: 20px;
    height: 20px;
}

.tag-span-icon-2 {
    width: 15px;
    height: 15px;
    margin-top: 2px;
    margin-right: 3px;
}

.tag-span-text {
    margin: 1px
}

.pagination {
    float: right;
    margin-right: 15%;
    padding-top: 15px;
    padding-bottom: 3%;
}
</style>