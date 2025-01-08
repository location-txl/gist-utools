<template>
  <a-modal
    v-model:visible="open"
    :title="isEdit ? '编辑 Gist' : '创建 Gist'"
    @ok="isEdit ? handleEdit() : handleCreate()"
    @cancel="handleCancel"
  >
    <a-form :model="gistForm">
      <a-form-item label="描述">
        <a-input v-model="gistForm.description" placeholder="请输入 Gist 描述" />
      </a-form-item>
      <a-form-item label="公开">
        <a-switch
          v-model="gistForm.public"
          :default-checked="true"
          :disabled="isEdit"
        />
      </a-form-item>
      <div v-for="(file, index) in gistForm.files" :key="index" class="file-item">
        <div class="file-header">
          <h4>{{ file.filename.length > 0 ? file.filename : '文件 ' + (index + 1) }}</h4>
          <a-button 
            type="text" 
            status="danger" 
            @click="removeFile(index)"
            v-if="gistForm.files.length > 1"
          >
            <template #icon><icon-delete /></template>
          </a-button>
        </div>
        <a-form-item label="文件名">
          <a-input v-model="file.filename" placeholder="example.js" @change="updateFileLanguage(index)" />
        </a-form-item>
        <a-form-item label="内容">
          <code-editor
            style="width: 100%;"
            v-model="file.content"
            :language="file.language"
            placeholder="请输入文件内容"
          />
        </a-form-item>
      </div>
      <div class="add-file">
        <a-button type="outline" @click="addFile">
          <template #icon><icon-plus /></template>
          添加文件
        </a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { gistApi } from '../api/gist'
import CodeEditor from './CodeEditor.vue'

interface GistFile {
  filename: string
  content: string
  language: string
}

interface Props {
  editMode?: boolean
  editGist?: {
    id: string
    description: string
    public?: boolean
    files: Record<string, { content: string; filename?: string }>
  }
}

const props = withDefaults(defineProps<Props>(), {
  editMode: false,
  editGist: undefined
})

const isEdit = computed(() => props.editMode &&  props.editGist !== undefined )

// 监听编辑模式的 Gist 数据变化
watch(() => props.editGist, (newGist) => {
  if (newGist) {
    gistForm.description = newGist.description
    gistForm.public = newGist.public ?? true
    gistForm.files = Object.entries(newGist.files).map(([filename, file]) => ({
      filename,
      content: file.content,
      language: getLanguageFromFilename(filename)
    }))
  }
}, { immediate: true })

const open = defineModel("open",{ required: true, type:Boolean })

const emit = defineEmits<{
  (e: 'created'): void
}>()

const languageMap: Record<string, string> = {
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'rb': 'ruby',
  'php': 'php',
  'java': 'java',
  'go': 'go',
  'rs': 'rust',
  'c': 'c',
  'cpp': 'cpp',
  'h': 'c',
  'hpp': 'cpp',
  'cs': 'csharp',
  'css': 'css',
  'less': 'less',
  'scss': 'scss',
  'html': 'html',
  'xml': 'xml',
  'md': 'markdown',
  'json': 'json',
  'yml': 'yaml',
  'yaml': 'yaml',
  'sh': 'bash',
  'bash': 'bash',
  'sql': 'sql',
  'swift': 'swift',
  'kt': 'kotlin',
  'dart': 'dart',
  'txt': 'plaintext',
  'vue': 'vue',
}

const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return languageMap[ext] || 'plaintext'
}

const gistForm = reactive({
  description: '',
  public: true,
  files: [
    {
      filename: '',
      content: '',
      language: 'plaintext'
    }
  ] as GistFile[]
})

const updateFileLanguage = (index: number) => {
  const file = gistForm.files[index]
  file.language = getLanguageFromFilename(file.filename)
}

const handleCancel = () => {
  resetForm()
}

const resetForm = () => {
  gistForm.description = ''
  gistForm.public = true
  gistForm.files = [{
    filename: '',
    content: '',
    language: 'plaintext'
  }]
}

const addFile = () => {
  gistForm.files.push({
    filename: '',
    content: '',
    language: 'plaintext'
  })
}

const removeFile = (index: number) => {
  gistForm.files.splice(index, 1)
}

const handleCreate = async () => {
  const invalidFiles = gistForm.files.some(file => !file.filename || !file.content)
  if (invalidFiles) {
    Message.error('所有文件的文件名和内容都不能为空')
    return
  }

  try {
    const files = gistForm.files.reduce((acc, file) => {
      acc[file.filename] = {
        content: file.content
      }
      return acc
    }, {} as Record<string, { content: string }>)

    await gistApi.createGist({
      description: gistForm.description,
      public: gistForm.public,
      files
    })
    Message.success('创建成功')
    emit('created')
    resetForm()
    open.value = false
  } catch (error) {
    console.error('Failed to create gist:', error)
    Message.error('创建失败')
  }
}

const handleEdit = async () => {
  const invalidFiles = gistForm.files.some(file => !file.filename || !file.content)
  if (invalidFiles) {
    Message.error('所有文件的文件名和内容都不能为空')
    return
  }

  try {
    const files = gistForm.files.reduce((acc, file) => {
      acc[file.filename] = {
        content: file.content
      }
      return acc
    }, {} as Record<string, { content: string }>)

    if (!props.editGist?.id) {
      throw new Error('Missing gist id')
    }

    await gistApi.updateGist(props.editGist.id, {
      description: gistForm.description,
      files
    })
    Message.success('更新成功')
    emit('created')
    resetForm()
    open.value = false
  } catch (error) {
    console.error('Failed to update gist:', error)
    Message.error('更新失败')
  }
}
</script>

<style scoped>
.file-item {
  border: 1px solid var(--color-neutral-3);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.file-header h4 {
  margin: 0;
}

.add-file {
  margin-top: 16px;
}
</style> 