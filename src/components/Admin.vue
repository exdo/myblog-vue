<template>
    <div style="height: 100%; padding: 0; margin: 0;">
        <Header style="position: fixed; width: 100%;"/>
        <div style="display: flex; height: 100%;">
            <el-aside width="10%" style="height: 100%; margin: 0;">
                <el-menu>
                    <el-menu-item style="margin-top: 65px" disabled>
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
                    <div id="vditor"/>
                </el-scrollbar>
            </el-main>
            <el-aside width="20%" style="height: 100%; margin: 0; padding-top: 65px; padding-left: 1%; padding-right: 1%">
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
                               @click="addArticle"
                               plain
                               style="width: 100%;"
                    >
                        保存
                    </el-button>
                </div>
            </el-aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import RecycleIcon from "../assets/RecycleIcon.vue";
import EditIcon from "../assets/EditIcon.vue";
import AdminIcon from "../assets/AdminIcon.vue";
import {useRouter} from "vue-router";
import { ElMessage } from "element-plus";
import { nextTick, ref } from 'vue';
import { ElInput } from 'element-plus';
import {onMounted } from 'vue';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import {getRequest, postRequest} from "../utils/api";
import Header from "../views/Header.vue";

//左侧导航栏
const router = useRouter();

function toManagePage() {
    router.push("/admin/manage");
}

function toRecyclePage() {
    router.push("/admin/recycle");
}
// ==========================================================================
//挂载Vditor的Markdown编辑器
const vditor = ref<Vditor | null>(null);
onMounted(() => {
    vditor.value = new Vditor('vditor', {
        width: '100%',
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
});
// ========================================================================
//右边侧边栏添加标签部分
const inputValue = ref('')
const dynamicTags = ref([])
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (tag: string) => {
    dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
}

const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
        InputRef.value!.input!.focus()
    })
}

const handleInputConfirm = () => {
    if (inputValue.value) {
        dynamicTags.value.push(inputValue.value)
    }
    inputVisible.value = false
    inputValue.value = ''
}
//右边侧边栏其他部分
//文章标题
const title = ref('');
//文章摘要
const summary = ref('');
//是否公开文章
const isPublic = ref(false);
//文章分类
const classification = ref('未分类');
//获取所有分类
const categories = ref([]);
getRequest("/category/all").then(res => {
    if (res.data.code === 200) {
        categories.value = res.data.content;
    } else {
        ElMessage.error(res.data.message);
    }
});
//保存按钮，上传文章内容
function addArticle() {
    if (title.value == null || title.value == '') {
        ElMessage.error("请输入标题");
        return;
    }
    if (summary.value == null || summary.value == '') {
        ElMessage.error("请完善摘要");
        return;
    }
    postRequest('/admin/article/add', {
        "title": title.value,
        "summary": summary.value,
        "content": vditor.value.getValue(),
        "isPublic": isPublic.value,
        "classification": classification.value,
        "tags": dynamicTags.value,
    }).then(res => {
        if (res.data.code == 200) {
            ElMessage.success(res.data.message);
            router.push("/admin/manage");
        } else {
            ElMessage.error(res.data.message);
        }
    })
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
</style>