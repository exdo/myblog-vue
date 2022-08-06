<template>
    <div style="height: 100%; padding: 0; margin: 0;">
        <Header style="position: fixed; width: 100%;"/>
        <div style="display: flex; height: 100%;">
            <el-aside width="10%" style="height: 100%; margin: 0;">
                <el-menu>
                    <el-menu-item style="margin-top: 65px" @click="toEditPage">
                        <EditIcon class="aside-icon"/>&nbsp;&nbsp;写文章
                    </el-menu-item>
                    <el-menu-item @click="toManagePage">
                        <AdminIcon class="aside-icon-2"/>&nbsp;管理文章
                    </el-menu-item>
                    <el-menu-item @click="toRecyclePage">
                        <RecycleIcon class="aside-icon-2"/>&nbsp;回收站
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-main class="main-content">
                <el-scrollbar>
                    <div class="article-title">
                        <h1 class="article-title-text">{{ originalTitle }}</h1>
                    </div>
                    <div id="vditor"/>
                </el-scrollbar>
            </el-main>
            <el-aside width="20%" style="height: 100%; margin: 0; padding-top: 70px; padding-left: 1%; padding-right: 1%">
                <div>
                    <p>标题：</p>
                    <el-input v-model="title" clearable>
                    </el-input>
                </div>
                <div>
                    <p>摘要：</p>
                    <el-input
                        v-model="summary"
                        rows="10"
                        type="textarea"
                        placeholder="请输入文章摘要"
                        maxlength="100"
                        minlength="20"
                        show-word-limit
                    />
                </div>
                <div style="margin-bottom: 6px">
                    公开：
                    <el-radio-group v-model="isPublic">
                        <el-radio :label="true">是</el-radio>
                        <el-radio :label="false">否</el-radio>
                    </el-radio-group>
                </div>
                <div>
                    分类：
                    <el-select
                        v-model="classification"
                        filterable
                        allow-create
                        default-first-option
                        :reserve-keyword="false"
                        placeholder="选择分类"
                    >
                        <el-option
                            v-for="item in categories"
                            :value="item"
                        />
                    </el-select>
                </div>
                <div style="display: block;">
                    <p style="width: 100%; border-bottom: 1px solid var(--el-border-color);">
                        标签：
                    </p>
                    <el-tag
                        v-for="tag in dynamicTags"
                        :key="tag"
                        class="mx-1"
                        closable
                        :disable-transitions="false"
                        @close="handleClose(tag)"
                    >
                        {{ tag }}
                    </el-tag>
                    <el-input
                        v-if="inputVisible"
                        ref="InputRef"
                        v-model="inputValue"
                        class="ml-1 w-20"
                        size="small"
                        @keyup.enter="handleInputConfirm"
                        @blur="handleInputConfirm"
                    />
                    <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
                        + 新标签
                    </el-button>
                </div>
                <br />
                <div>
                    <el-button type="primary"
                               @click="updateArticle"
                               plain
                               style="width: 100%;"
                    >
                        更新
                    </el-button>
                </div>
            </el-aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import EditIcon from "../assets/EditIcon.vue";
import RecycleIcon from "../assets/RecycleIcon.vue";
import AdminIcon from "../assets/AdminIcon.vue";
import {useRoute, useRouter} from "vue-router";
import { ElMessage } from "element-plus";
import { nextTick, ref } from 'vue';
import { ElInput } from 'element-plus';
import {onMounted } from 'vue';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import {getRequest, postRequest} from "../utils/api";
import Header from "../views/Header.vue";

//左侧导航菜单
const router = useRouter();
function toEditPage() {
    router.push("/admin/edit")
}

function toManagePage() {
    router.push("/admin/manage");
}

function toRecyclePage() {
    router.push("/admin/recycle");
}
// ==========================================================================
//挂载Vditor的Markdown编辑器，渲染需要更新的文章
const vditor = ref<Vditor | null>(null);
const route = useRoute();
//从路由中获取文章ID
const articleId = route.params.articleId;
//从后端获取文章内容
const article = ref('');

onMounted(() => {
    getRequest('/admin/article/id/' + articleId).then(res => {
        if (res.data.code == 200) {
            article.value = res.data.content.content;
        } else {
            ElMessage.error(res.data.message);
        }
    }).then(() => {
        vditor.value = new Vditor('vditor', {
            width: '100%',
            value: article.value,
            cache: { enable: false, },
            toolbarConfig: { pin: true, },
            upload: {
                url: "https://blog.idaoteng.xyz/api/admin/article/pic",
                fieldName: "pic",
                headers: {
                    'Authorization': window.localStorage.getItem("authToken"),
                },
            },
            after: () => {
                vditor.value!.setTheme("classic" , "Ant Design", "emacs");
            },
        });
    })
});
// ========================================================================
//右边侧边栏
//从sessionStorage中获取文章目录
const catalogSting = window.sessionStorage.getItem("catalog");
const catalog = JSON.parse(catalogSting);
//根据文章目录得到文章标题
const title = ref('');
title.value = catalog.title;
//用于展示原标题
const originalTitle = ref('');
originalTitle.value = catalog.title;
//从后端获取文章摘要
const summary = ref('');
getRequest("/admin/article/summaryText?articleId=" + articleId).then(res => {
    if (res.data.code == 200) {
        summary.value = res.data.content;
    } else {
        ElMessage.error("未能从后端获取到摘要");
    }
});
//根据文章目录得到文章是否公开
const isPublic = ref();
isPublic.value = catalog.isPublic;
//根据文章目录得到文章分类
const classification = ref('');
classification.value = catalog.classification;
//获取所有分类
const categories = ref([]);
getRequest("/category/all").then(res => {
    if (res.data.code === 200) {
        categories.value = res.data.content;
    } else {
        ElMessage.error(res.data.message);
    }
});
//----------------------右边侧边栏添加标签部分-------------------
const inputValue = ref('')
const dynamicTags = ref([])
dynamicTags.value = catalog.tags;
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (tag: string) => {
    //删除标签
    dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
    getRequest("/admin/article/delete/tag?title=" + title.value + "&tag=" + tag).then(res =>{
        if (res.data.code == 200) {
            ElMessage.success(res.data.message);
        } else {
            ElMessage.error(res.data.message);
        }
    });
}

const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
        InputRef.value!.input!.focus();
    })
}

const handleInputConfirm = () => {
    //添加新标签
    if (inputValue.value) {
        dynamicTags.value.push(inputValue.value);
        getRequest("/admin/article/add/tag?title=" + title.value + "&tag=" + inputValue.value).then(res =>{
            if (res.data.code == 200) {
                ElMessage.success(res.data.message);
            } else {
                ElMessage.error(res.data.message);
            }
        });
    }
    inputVisible.value = false;
    inputValue.value = '';
}
//上传文章内容
function updateArticle() {
    if (title.value == null || title.value == '') {
        ElMessage.error("请输入标题");
        return;
    }
    postRequest('/admin/article/update', {
        "articleId": articleId,
        "title": title.value,
        "content": vditor.value.getValue(),
        "isPublic": isPublic.value,
        "classification": classification.value,
        "tags": dynamicTags.value,
    }).then(res => {
        if (res.data.code == 200) {
            ElMessage.success(res.data.message);
        } else {
            ElMessage.error(res.data.message);
        }
    })
}
</script>

<style scoped>
.main-content {
    display: block;
    padding-top: 65px;
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

.article-title {
    width: fit-content;
}

.article-title-text {
    background-image: linear-gradient(135deg, #81FFEF 10%, #F067B4 100%);
    -webkit-background-clip: text;
    color: transparent;
    font-size: xx-large;
}
</style>