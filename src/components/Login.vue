<template>
    <Header style="position: fixed; width: 100%; top: 0;"/>
    <div class="login-container">
        <h3 class="login-title">登录</h3>
        <el-form :model="loginData" ref="formRef" :rules="rules">
            <el-space direction="vertical" fill class="login-main">
                <el-form-item prop="name" size="large">
                    <el-input placeholder="请输入用户名" v-model="loginData.name" clearable/>
                </el-form-item>
                <el-form-item prop="password" size="large">
                    <el-input type="password" placeholder="请输入密码"
                              v-model="loginData.password" clearable show-password>
                    </el-input>
                </el-form-item>
                <el-space>
                    <el-form-item prop="feedback" size="large" style="width: 150px;">
                        <el-input placeholder="请输入验证码"
                                  v-model="loginData.feedback" clearable>
                        </el-input>
                    </el-form-item>
                    <div style="width: 100px; height: 62px; top: 0;">
                        <el-image :src="captchaUrl" alt="验证码"/>
                    </div>
                    <div class="flash-button">
                        <el-button type="primary" size="large"
                                   @click="renderCaptcha" style="top: 0;">
                            刷新验证码
                        </el-button>
                    </div>
                </el-space>
                <el-button type="primary" size="large"
                           @click="tryLogin(formRef)" style="width: 100%;">
                    登录
                </el-button>
            </el-space>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import Header from "/src/views/Header.vue";
import {reactive, ref} from "vue";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {useRouter} from "vue-router";
import {getCaptcha, getTempToken, postLoginData} from "/src/utils/api.js"

//登录时需要上传的数据（DTO）
const loginData = reactive({
    name: '',
    password: '',
    feedback: '',
});
//表单校验规则
const rules = reactive<FormRules>({
    name: [
        { required: true, message: '请输入用户名', trigger: 'blur'}
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur'}
    ],
    feedback: [
        { required: true, message: '请输入验证码', trigger: 'blur'}
    ],
});
//临时token和初始验证码
const tempToken = ref('');
const captchaUrl = ref('');
//初始化验证码
function initCaptcha() {
    getTempToken().then(res => {
        if (res.data.code === 200) {
            tempToken.value = res.data.content.receiptId;
            captchaUrl.value = res.data.content.outputObject;
        }
    });
}
initCaptcha();
//刷新验证码
function renderCaptcha()  {
    getCaptcha(tempToken.value).then(res => {
        if (res.data.code === 200) {
            captchaUrl.value = res.data.content;
        } else {
            //临时token可能过期，获取新的临时token和初始化验证码
            initCaptcha();
        }
    });
}
//校验表单数据尝试登录
const router = useRouter();
const formRef = ref<FormInstance>();
const tryLogin = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            //表单校验通过后尝试登录
            postLoginData(loginData, tempToken.value).then(res => {
                if (res.data.code === 200) {
                    ElMessage.success(res.data.message);
                    //登录成功后将token保存
                    window.localStorage.setItem("authToken", res.data.content);
                    //路由到Admin.vue
                    router.push("/admin/edit");
                } else {
                    ElMessage.error(res.data.message);
                }
            });
        } else {
            //表单校验不通过则弹出提示信息
            ElMessage({
                message: "请输入所有字段",
                type: "error",
            });
        }
    });
}
</script>

<style scoped>
.login-container {
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 430px;
    height: 330px;
    border-radius: 41px;
    background: #ffffff;
    box-shadow: 10px 10px 20px #b0b0b0,
    -10px -10px 20px #ffffff;
}

.login-main {
    position: absolute;
    top: 50px;
    left: 20px;
    right: 20px;
    bottom: 20px;
}

.login-title {
    text-align: center;
    font-size:125%;
    background-image: linear-gradient( 135deg, #ABDCFF 10%, #0396FF 100%);
    -webkit-background-clip: text;
    color: transparent;
}

.icon-pic {
    width: 30px;
    height: 30px;
}

.flash-button {
    position: relative;
    margin: 0;
    height: 62px;
    right: 0;
    top: 0;
}
</style>