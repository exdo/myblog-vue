<template>
    <Header style="position: fixed; width: 100%; top: 0; z-index: 99999"/>
    <el-scrollbar ref="scrollbar">
        <div style="margin-top: 65px;">
            <div class="article-title">
                <h1 class="article-title-text">{{ summary.title }}</h1>
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
                    <ModifiedIcon class="tag-span-icon"/>
                    <div class="tag-span-text">
                        <el-tag size="small" type="warning" effect="plain">
                            {{ summary.lastModifiedTime }}
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
            <div id="articleView" class="article-content"/>
            <br/>
            <br/>
            <div class="previous-and-next">
                <el-card v-show="hasPrevious"
                         @click="toPrevious"
                         shadow="hover"
                         class="previous-and-next-card">
                    <template #header>
                        <span style="color: #ef6b63">????????????{{ previous.title }}</span>
                    </template>
                    {{ previous.summary }}
                </el-card>
                <el-card v-show="hasNext"
                         @click="toNext"
                         shadow="hover"
                         class="previous-and-next-card">
                    <template #header>
                        <span style="color: #ef6b63">????????????{{ next.title }}</span>
                    </template>
                    {{ next.summary }}
                </el-card>
            </div>
        </div>
        <ToTop @click="toTop"/>
        <ToBottom @click="toBottom"/>
    </el-scrollbar>
</template>

<script setup lang="ts">
import Header from "../views/Header.vue";
import {useRoute, useRouter} from "vue-router";
import DateIcon from "../assets/DateIcon.vue";
import CategoryIcon from "../assets/CategoryIcon.vue";
import TagIcon from "../assets/TagIcon.vue";
import ToTop from "../views/ToTop.vue";
import ToBottom from "../views/ToBottom.vue";
import { getRequest } from  "/src/utils/api.js";
import {ref} from "vue";
import {ElMessage, ElScrollbar} from "element-plus";
import VditorPreview from 'vditor/dist/method.min';
import 'vditor/dist/index.css';
import ModifiedIcon from "../assets/ModifiedIcon.vue";

//????????????????????????articleId
const route = useRoute();
const articleId = ref();
articleId.value = route.params.articleId;
//??????articleId??????????????????????????????
const summaryString = window.sessionStorage.getItem("summary");
const summary = ref();
function fetchSummary() {
    summary.value = JSON.parse(summaryString);
}
fetchSummary();
//Vditor????????????????????????
function renderContent(contentText: String) {
    const contentElement = document.getElementById("articleView");
    VditorPreview.preview(contentElement, contentText, {
        hljs: { enable: true, style: "tango", lineNumber: true, },
        markdown: { autoSpace: true,},
        theme: { current: "ant-design", }
    });
}
//??????articleId???????????????????????????
const router = useRouter();
function fetchContent() {
    getRequest('/article/id/' + articleId.value).then(res => {
        if (res.data.code === 200) {
            const articleContent = res.data.content.content;
            //??????Vditor??????????????????
            renderContent(articleContent);
        } else {
            //??????????????????????????????????????????Home.vue
            ElMessage.error(res.data.message);
            router.push("/");
        }
    });
}
fetchContent();
//========================================================================================
//------------?????????------------
const previous = ref({
    articleId: String,
    firstReleaseDate: String,
    lastModifiedTime: String,
    classification: String,
    tags: [],
    title: String,
    summary: String,
});
const hasPrevious =ref(false);
//?????????????????????????????????
getRequest('/article/previous?articleId=' + articleId.value).then((res) => {
   if (res.data.code == 200) {
       previous.value = res.data.content;
       hasPrevious.value = true;
   }
});

function toPrevious() {
    //????????????????????????
    const summaryString = JSON.stringify(previous.value);
    window.sessionStorage.setItem("summary", summaryString);
    //?????????AnotherArticle.vue
    router.push("/anotherArticle/" + previous.value.articleId);
}

//------------?????????------------
const next = ref({
    articleId: String,
    firstReleaseDate: String,
    lastModifiedTime: String,
    classification: String,
    tags: [],
    title: String,
    summary: String,
});
const hasNext =ref(false);
//?????????????????????????????????
getRequest('/article/next?articleId=' + articleId.value).then((res) => {
    if (res.data.code == 200) {
        next.value = res.data.content;
        hasNext.value = true;
    }
});
function toNext() {
    //????????????????????????????????????
    const summaryString = JSON.stringify(next.value);
    window.sessionStorage.setItem("summary", summaryString);
    router.push("/anotherArticle/" + next.value.articleId);
}

//========================================================================================
const scrollbar = ref<InstanceType<typeof ElScrollbar>>();
//????????????
function toTop() {
    scrollbar.value.setScrollTop(0);
}
//????????????
function toBottom() {
    scrollbar.value.setScrollTop(99999);
}
</script>

<style scoped>
.article-title {
    width: fit-content;
    padding-left: 15%;
    padding-right: 15%;
}

.article-title-text {
    background-image: linear-gradient(135deg, #81FFEF 10%, #F067B4 100%);
    -webkit-background-clip: text;
    color: transparent;
}

.tag {
    display: flex;
    padding-left: 15%;
    padding-right: 15%;
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

.article-content {
    font-size: 16px;
    padding-left: 15%;
    padding-right: 15%;
    height: 100%;
}

.previous-and-next {
    display: block;
    padding-left: 15%;
    padding-right: 15%;
    margin-bottom: 50px;
}

.previous-and-next-card {
    margin-top: 10px;
    margin-bottom: 10px;
}

.previous-and-next-card:hover {
    cursor:pointer;
}
</style>