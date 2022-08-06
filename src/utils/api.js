import axios from "axios";

const request = axios.create({
    //生产环境
    //baseURL: 'https://blog.idaoteng.xyz/api',
    //本地开发环境
    baseURL: 'http://localhost:3000/api',
    timeout: 5000,
});
//通用post请求
export async function postRequest(url, data) {
    return request(url, {
        method: "POST",
        headers: {
            'Authorization': window.localStorage.getItem("authToken"),
            'Content-Type': 'application/json;charset=UTF-8',
        },
        data: data,
    });
}
//通用get请求
export async function getRequest(url) {
    return request(url, {
        method: "GET",
        headers: {
            'Authorization': window.localStorage.getItem("authToken"),
        },
    });
}
//获取临时token
export async function getTempToken() {
    return request('/login/receipt', {method: 'GET'});
}
//获取验证码
export async function getCaptcha(tempToken)  {
    return request('/login/captcha', {
        headers: { 'Receipt': tempToken },
        method: 'GET',
    });
}
//尝试登入
export async function postLoginData(body, tempToken) {
    return request('/login', {
        headers: {
            'Receipt': tempToken,
            'Content-Type': 'application/json;charset=UTF-8',
        },
        data: body,
        method: 'POST',
    });
}
