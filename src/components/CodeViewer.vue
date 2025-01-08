<template>
  <div class="code-container">
    <a-button class="copy-button" type="text" size="small" @click="copyCode">
      <template #icon>
        <icon-copy :size="20" />
      </template>
    </a-button>
    <pre><code :class="'language-' + language" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { computed, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconCopy } from '@arco-design/web-vue/es/icon';

const props = defineProps<{
  code: string
  language?: string
}>()

const copyCode = () => {
  navigator.clipboard.writeText(props.code).then(() => {
    Message.success('复制成功');
  }).catch(() => {
    Message.error('复制失败');
  });
};

const highlightedCode = computed(() => {
  if (!props.language) {
    return hljs.highlightAuto(props.code).value
  }
  try {
    return hljs.highlight(props.code, { language: props.language.toLowerCase() }).value
  } catch {
    return hljs.highlightAuto(props.code).value
  }
})
</script>

<style scoped>
.code-container {
  width: 100%;
  text-align: left;
  position: relative;
}

.copy-button {
  position: absolute;
  top: 3px;
  right: 3px;
  z-index: 1;
  opacity: 0.7;
  font-size: 20px;
  width: 32px;
  height: 32px;
}

.copy-button:hover {
  opacity: 1;
}

pre {
  margin: 0;
  background-color: #f6f8fa;
  padding: 30px 16px 2px;
  border-radius: 6px;
  overflow-x: auto;
}

code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

:deep(.hljs-params) {
  color:#24292e;
  font-weight: 500;
}

:deep(.hljs-function) {
  color: #6f42c1;
  font-weight: bold;
}

/* :deep(.hljs-title), */
/* :deep(.hljs-title.function_), */
:deep(.hljs-title) {
  color: #0550ae !important;
  font-weight: bold;
}

:deep(.hljs-punctuation) {
  color: #24292e;
}
</style> 