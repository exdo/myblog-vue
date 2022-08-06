import { createRouter, createWebHistory } from 'vue-router';
import Home from '/src/components/Home.vue';
import Article from '/src/components/Article.vue';
import AnotherArticle from '/src/components/AnotherArticle.vue';
import Tags from '/src/components/Tags.vue';
import TagResult from "/src/components/TagResult.vue";
import Category from '/src/components/Categories.vue';
import CategoryResult from "/src/components/CategoryResult.vue";
import Login from '/src/components/Login.vue';
import Admin from "/src/components/Admin.vue";
import Manage from '/src/components/Manage.vue';
import Recycle from '/src/components/Recycle.vue';
import Update from '/src/components/Update.vue';
import Flash from '/src/views/Flash.vue';
import {getRequest} from "./api";
import {ElMessage} from "element-plus";

//检查是否需要清空缓存
const hasNew = async (to, from) => {
    const lastRequestTime = window.localStorage.getItem('last_request_time');
    if (lastRequestTime !== null) {
        await getRequest("/hasNew?lastRequestTime=" + lastRequestTime).then(res => {
            if (res.data.content === 1) {
                window.sessionStorage.clear();
                const now = new Date().getTime();
                window.localStorage.setItem('last_request_time', now.toString());
            }
        });
    } else {
        const now = new Date().getTime();
        console.log(now)
        window.localStorage.setItem('last_request_time', now.toString());
    }

    return true;
};


//检查是否登入
const isLoggedIn = async (to, from) => {
    let isLogin = false;
    await getRequest("/alreadyLogged").then(res => {
        if (res.data.code === 200) {
            isLogin = true;
        } else {
            ElMessage.error(res.data.message);
        }
    });
    if (isLogin) {
        return true;
    }
    return '/login';
};

const routes = [
    { path: '/',
        component: Home,
        beforeEnter: hasNew,
    },
    { path: '/article/:articleId', component: Article },
    { path: '/anotherArticle/:articleId', component: AnotherArticle },
    { path: "/tags", component: Tags },
    { path: "/tagResult/:tagName",
        component: TagResult,
        beforeEnter: hasNew,
    },
    { path: "/categories", component: Category },
    { path: "/categoryResult/:categoryName",
        component: CategoryResult,
        beforeEnter: hasNew,
    },
    { path: "/login", component: Login },
    { path: "/admin/edit",
        component: Admin,
        beforeEnter: isLoggedIn,
    },
    { path: "/admin/manage",
        component: Manage,
        beforeEnter: isLoggedIn,
    },
    { path: "/admin/recycle",
        component: Recycle,
        beforeEnter: isLoggedIn,
    },
    { path: "/update/:articleId",
        component: Update,
        beforeEnter: isLoggedIn,
    },
    { path: "/flash", component: Flash },
]

export const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});