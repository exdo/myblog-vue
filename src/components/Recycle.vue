<template>
    <div style="height: 100%; padding: 0; margin: 0;">
        <Header style="position: fixed; width: 100%;"/>
        <div style="display: flex; height: 100%;">
            <el-aside width="10%" style="height: 100%; margin: 0;">
                <el-menu>
                    <el-menu-item @click="toEditPage" style="margin-top: 65px">
                        <EditIcon class="aside-icon"/>&nbsp;&nbsp;写文章
                    </el-menu-item>
                    <el-menu-item @click="toManagePage">
                        <AdminIcon class="aside-icon-2"/>&nbsp;管理文章
                    </el-menu-item>
                    <el-menu-item disabled>
                        <RecycleIcon class="aside-icon-2"/>&nbsp;回收站
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main class="main-content">
                <el-scrollbar>
                    <div v-for="catalog in catalogs" class="card">
                        <el-card>
                            <template #header>
                                <div class="card-header">
                                    <h1 class="card-header-title">
                                        {{ catalog.title }}
                                    </h1>
                                    <span>
                                            <span>
                                                <el-button text bg type="primary"
                                                           @click="recycleArticle(catalog.articleId)">
                                                    回收
                                                </el-button>
                                            </span>&nbsp;
                                            <span>
                                                <el-button text bg type="danger"
                                                           @click="dropArticle(catalog.articleId)">
                                                    删除
                                                </el-button>
                                            </span>
                                        </span>
                                </div>
                                <div class="tag">
                                    <div class="tag-span">
                                        <DateIcon class="tag-span-icon"/>
                                        <div class="tag-span-text">
                                            <el-tag size="small" effect="plain">
                                                {{ catalog.firstReleaseDate }}
                                            </el-tag>
                                        </div>
                                    </div>
                                    <div class="tag-span">
                                        <ModifiedIcon class="tag-span-icon"/>
                                        <div class="tag-span-text">
                                            <el-tag size="small" type="warning" effect="plain">
                                                {{ catalog.lastModifiedTime }}
                                            </el-tag>
                                        </div>
                                    </div>
                                    <div class="tag-span">
                                        <CategoryIcon class="tag-span-icon-2"/>
                                        <div class="tag-span-text">
                                            <el-tag size="small" effect="plain">
                                                {{ catalog.classification }}
                                            </el-tag>
                                        </div>
                                    </div>
                                    <div class="tag-span">
                                        <InvisibleIcon class="tag-span-icon"/>
                                        <div class="tag-span-text">
                                            <el-tag size="small" :type="isArticlePublic(catalog.isPublic)" effect="plain">
                                                {{ catalog.isPublic ? "已公开" : "未公开" }}
                                            </el-tag>
                                        </div>
                                    </div>
                                    <div class="tag-span">
                                        <TagIcon class="tag-span-icon"/>&nbsp;&nbsp;
                                        <div v-for="tagName in catalog.tags">
                                            <el-tag size="small" effect="plain">
                                                {{ tagName }}
                                            </el-tag>&nbsp;
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-card>
                    </div>
                    <el-pagination
                        v-model:currentPage="currentPage"
                        v-model:page-size="pageSize"
                        background
                        layout="prev, pager, next, jumper"
                        :total="total"
                        @current-change="changePage"
                        class="pagination"
                    />
                </el-scrollbar>
            </el-main>
        </div>
    </div>
</template>

<script setup lang="ts">
import DateIcon from "../assets/DateIcon.vue";
import ModifiedIcon from "../assets/ModifiedIcon.vue";
import CategoryIcon from "../assets/CategoryIcon.vue";
import InvisibleIcon from "../assets/InvisibleIcon.vue";
import TagIcon from "../assets/TagIcon.vue";
import EditIcon from "../assets/EditIcon.vue";
import AdminIcon from "../assets/AdminIcon.vue";
import {useRouter} from "vue-router";
import {ElMessage, ElScrollbar} from "element-plus";
import {getRequest} from "../utils/api";
import {ref} from "vue";
import Header from "../views/Header.vue";
import RecycleIcon from "../assets/RecycleIcon.vue";

//检查是否需要清空缓存
const lastRequestTime = window.localStorage.getItem('last_request_time');
if (lastRequestTime !== null) {
    getRequest("/hasNew?lastRequestTime=" + lastRequestTime).then(res => {
        if (res.data.content === 1) {
            window.sessionStorage.clear();
            console.log("session缓存已清空");
            const now = new Date().getTime();
            window.localStorage.setItem('last_request_time', now.toString());
        }
    });
} else {
    const now = new Date().getTime();
    window.localStorage.setItem('last_request_time', now.toString());
}
//============================================================================
//左侧导航菜单
const router = useRouter();

function toEditPage() {
    router.push("/admin/edit");
}

function toManagePage() {
    router.push("/admin/manage");
}
//===========================================================================
//回收按钮
function recycleArticle(articleId) {
    getRequest("/admin/article/recycle?articleId=" + articleId).then(res =>{
        if (res.data.code == 200) {
            ElMessage.success(res.data.message);
            //刷新页面
            router.replace("/flash");
        } else {
            ElMessage.error(res.data.message);
        }
    });
}
//删除按钮（彻底删除)
function dropArticle(articleId) {
    getRequest("/admin/article/delete?articleId=" + articleId).then(res =>{
        if (res.data.code == 200) {
            ElMessage.success(res.data.message);
            //刷新页面
            router.replace("/flash");
        } else {
            ElMessage.error(res.data.message);
        }
    });
}
//=============================================================
//根据文章是否公开展示不同类型的标签
function isArticlePublic(pub) {
    if (pub) {
        return "success";
    } else {
        return "danger";
    }
}
//=============================================================
//获取文章目录的总数
const total = ref(0);
getRequest('/admin/article/total/abandoned').then(res => {
    total.value = res.data.content;
});
const currentPage = ref(1);
const pageSize = ref(5);
//文章目录VO
const catalogs = ref({
    articleId: String,
    title: String,
    isPublic: Boolean,
    firstReleaseDate: String,
    lastModifiedTime: String,
    classification: String,
    tags: []
}[pageSize]);
//获取第一页文章目录
getRequest('/admin/article/catalog/dropped?pageIndex=1').then(res => {
    if (res.data.code === 200) {
        catalogs.value = res.data.content;
        //缓存当前页
        const catalogsString = JSON.stringify(res.data.content);
        window.sessionStorage.setItem("recyclePage_index_1", catalogsString);
    } else {
        ElMessage.error(res.data.message);
    }
});
//更换页面
const changePage = (pageIndex: number) => {
    const prefix = "recyclePage_index_";
    const cachedCatalogsString = window.sessionStorage.getItem(prefix + pageIndex);
    //检查是否有缓存
    if (cachedCatalogsString == null) {
        //没缓存则从后端获取
        getRequest('/admin/article/catalog/dropped?pageIndex=' + pageIndex).then(res => {
            catalogs.value = res.data.content;
            //缓存当前页
            const catalogsString = JSON.stringify(res.data.content);
            window.sessionStorage.setItem(prefix + pageIndex, catalogsString);
        });
    } else {
        //有缓存则使用缓存数据
        catalogs.value = JSON.parse(cachedCatalogsString);
    }
}
</script>

<style scoped>
.main-content {
    display: block;
    padding-top: 75px;
    padding-left: 5%;
    padding-right: 5%;
    width: 70%;
    border-right: 2px solid var(--el-border-color);
    border-left: 1px solid var(--el-border-color);
}

.aside-icon {
    width: 20px;
    height: 20px;
}

.aside-icon-2 {
    width: 25px;
    height: 25px;
}

.card {
    padding-left: 5%;
    padding-right: 5%;
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