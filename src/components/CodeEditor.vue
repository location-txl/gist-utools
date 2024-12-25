<template>
  <div class="code-editor">
    <div class="editor-header">
      <span class="language-label">{{ language }}</span>
    </div>
    <div class="editor-content" :class="{ 'is-focused': isFocused }">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown="handleKeydown"
        :placeholder="placeholder"
        spellcheck="false"
      ></textarea>
      <pre><code ref="codeRef"></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'

// 根据需要导入语言支持
import 'highlight.js/lib/common'

const props = defineProps<{
  modelValue: string
  language: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const codeRef = ref<HTMLElement>()
const isFocused = ref(false)

const updateHighlight = () => {
  if (codeRef.value) {
    codeRef.value.textContent = props.modelValue || ' '
    codeRef.value.className = `language-${props.language}`
    delete codeRef.value.dataset.highlighted
    try {
      hljs.highlightElement(codeRef.value)
      console.log('Highlighting applied for language:', props.language)
    } catch (error) {
      console.error('Highlighting failed:', error)
    }
  }
}

const handleInput = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = e.target as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value
    
    const newValue = value.substring(0, start) + '    ' + value.substring(end)
    emit('update:modelValue', newValue)
    
    // 设置光标位置
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 4
    })
  }
}

watch(() => props.modelValue, () => {
    console.log('modelValue changed:', props.modelValue)
  updateHighlight()
})

watch(() => props.language, () => {
  updateHighlight()
})

onMounted(() => {
  console.log('Available languages:', hljs.listLanguages())
  updateHighlight()
})
</script>

<style scoped>
.code-editor {
  border: 1px solid var(--color-neutral-3);
  border-radius: 4px;
  overflow: hidden;
}

.editor-header {
  padding: 8px 12px;
  background: var(--color-neutral-2);
  border-bottom: 1px solid var(--color-neutral-3);
}

.language-label {
  font-size: 12px;
  color: var(--color-text-3);
  text-transform: uppercase;
}

.editor-content {
  position: relative;
  padding: 0;
  background: var(--color-bg-2);
}

.editor-content.is-focused {
  outline: 2px solid var(--color-primary-light-2);
}

textarea {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 12px;
  border: none;
  background: transparent;
  color: transparent;
  caret-color: var(--color-text-1);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  resize: vertical;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: auto;
  tab-size: 4;
  outline: none;
  z-index: 1;
}

pre {
  margin: 0;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: transparent !important;
}

pre code {
  background: transparent !important;
  padding: 0 !important;
}

:deep(.hljs) {
  background: transparent !important;
}
</style> 