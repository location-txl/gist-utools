<template>
    <div class="token-setting">
        <h2>设置 GitHub Token</h2>
        <p>请输入您的 GitHub Personal Access Token 以使用 Gist 功能</p>

        <a-input-password v-model="formData.token" placeholder="请输入 GitHub Token" allow-clear />


        <a-button style="margin-top: 10px;" type="primary" @click="saveToken" :disabled="!formData.token">
            保存
        </a-button>


        <div class="token-help">
            <p>如何获取 Token:</p>
            <ol>
                <li>访问 GitHub 设置页面的
                    <a @click="openGithubTokenPage">Personal access tokens</a>
                </li>
                <li>点击 "Generate new token (classic)"</li>
                <li>为 token 添加描述</li>
                <li>选择 "gist" 权限</li>
                <li>点击 "Generate token" 生成</li>
            </ol>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { token } from '../api/gist'

const formData = reactive({
    token: ''
})

const saveToken = () => {
    token.value = formData.token
    formData.token = ''
}

const openGithubTokenPage = () => {
    utools.shellOpenExternal('https://github.com/settings/tokens')
}
</script>

<style scoped>
.token-setting {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
}

.token-form {
    width: 100%;
}

.token-form :deep(.arco-form-item-wrapper) {
    width: 100%;
}

.token-help {
    margin-top: 20px;
    padding: 15px;
    background-color: var(--color-fill-2);
    border-radius: 4px;
}

.token-help ol {
    padding-left: 20px;
}

.token-help li {
    margin: 8px 0;
}

a {
    color: rgb(var(--primary-6));
    cursor: pointer;
}

a:hover {
    text-decoration: underline;
}
</style>