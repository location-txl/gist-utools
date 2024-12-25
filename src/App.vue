<template>
  <a-config-provider>
    <template v-if="token">
      <gist-list />
    </template>
    <template v-else>
      <token-setting />
    </template>
  </a-config-provider>
</template>

<script setup lang="ts">
import GistList from './components/GistList.vue'
import TokenSetting from './components/TokenSetting.vue'
import { token } from './api/gist'
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
