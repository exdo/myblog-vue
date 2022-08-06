<template>
    <el-container>
        <el-header style="padding: 0;">
            <el-menu mode="horizontal" :ellipsis="false">
                <el-menu-item index="0" style="margin-left: 5%;" @click="toHomePage">
                    <LogoIcon class="header-logo"/>
                    <span class="header-logo-title">idaoteng</span>
                </el-menu-item>
                <div style="flex-grow: 1"></div>
                <el-menu-item index="1" @click="toHomePage">
                    <HomeIcon class="header-menu"/>首页
                </el-menu-item>
                <el-menu-item index="2" @click="toCategoriesPage">
                    <CategoryIcon class="header-menu-2"/>分类
                </el-menu-item>
                <el-menu-item index="3" @click="toTagsPage">
                    <TagIcon class="header-menu-3"/>标签
                </el-menu-item>
                <el-menu-item index="4" @click="toAdminPage">
                    <AdminIcon class="header-menu-3"/>管理
                </el-menu-item>
                <el-sub-menu index="5" style="margin-right: 5%;">
                    <template #title>
                        <UserIcon class="header-menu-3"/>账号
                    </template>
                    <el-menu-item index="5-1" @click="toLoginPage">
                        <LoginIcon class="header-sub-menu"/>登录
                    </el-menu-item>
                    <el-menu-item index="5-2" @click="logout">
                        <LogoutIcon class="header-sub-menu-2"/>登出
                    </el-menu-item>
<!--                    <el-menu-item index="5-3" @click="toRegisterPage">-->
<!--                        <RegisterIcon class="header-sub-menu-3"/>注册-->
<!--                    </el-menu-item>-->
                </el-sub-menu>
            </el-menu>
        </el-header>
    </el-container>
</template>

<script setup lang="ts">
import LoginIcon from "/src/assets/LoginIcon.vue";
import LogoutIcon from "/src/assets/LogoutIcon.vue";
// import RegisterIcon from "/src/assets/RegisterIcon.vue";
import HomeIcon from "/src/assets/HomeIcon.vue";
import CategoryIcon from "/src/assets/CategoryIcon.vue";
import TagIcon from "/src/assets/TagIcon.vue";
import AdminIcon from "/src/assets/AdminIcon.vue";
import UserIcon from "/src/assets/UserIcon.vue";
import LogoIcon from "../assets/LogoIcon.vue";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {postRequest} from "/src/utils/api.js";

const router = useRouter();
function toHomePage() {
    router.push("/");
}

function toCategoriesPage() {
    router.push("/categories");
}

function toTagsPage() {
    router.push("/tags");
}

function toAdminPage() {
    router.push("/admin/edit");
}

function toLoginPage() {
    router.push("/login");
}

function logout() {
    postRequest('/logout', null).then(res => {
        if (res.data.code == 200) {
            window.localStorage.removeItem('authToken');
            ElMessage.success(res.data.message);
            router.push("/");
        } else {
            ElMessage.error(res.data.message);
        }
    });
}
</script>

<style scoped>
.header-logo {
    width: 35px;
    height: 35px;
    margin-right: 10px;
    margin-bottom: 5px;
}

.header-logo-title {
    font-size: 20px;
    font-weight: bold;
    background-image: linear-gradient( 135deg, #FFD26F 10%, #3677FF 100%);
    -webkit-background-clip: text;
    color: transparent;
}

.header-menu {
    width: 25px;
    height: 25px;
    margin-right: 8px;
}

.header-menu-2 {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}

.header-menu-3 {
    width: 30px;
    height: 30px;
    margin-right: 8px;
}

.header-sub-menu {
    width: 30px;
    height: 30px;
    margin-bottom: 6px;
    margin-right: 3px;
}

.header-sub-menu-2 {
    width: 20px;
    height: 20px;
    margin-bottom: 6px;
    margin-right: 10px;
    margin-left: 3px;
}

/*.header-sub-menu-3 {*/
/*    width: 25px;*/
/*    height: 25px;*/
/*    margin-bottom: 6px;*/
/*    margin-right: 7px;*/
/*}*/
</style>