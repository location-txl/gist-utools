<template>
  <div class="gist-list">
    <a-space direction="vertical" :size="16" fill>
      <create-gist-modal
        v-model:open="createGistModalRef"
        :edit-mode="!!editingGist"
        :edit-gist="editingGist"
        @created="refreshGists"
      />
  
      <a-spin :loading="loading">
        <a-space direction="vertical" :size="16" fill>
          <a-card v-for="gist in gists" :key="gist.id" class="gist-card">
            <template #title>
              <a-space>

                <a-tag>{{ formatDate(gist.created_at) }}</a-tag>
                <a-tag :color="gist.public ? 'green': 'red'">
                  {{ gist.public ? '公开' : '私有'}}
                </a-tag>
              </a-space>
            </template>
            <template #extra>
              <a-space>
                <a-link @click="openGist(gist.html_url)" target="_blank">
                  在 GitHub 中查看
                </a-link>
                <a-button type="text" @click="showEditModal(gist)" :loading="editingId === gist.id">
                  <template #icon>
                    <icon-edit />
                  </template>
                  编辑
                </a-button>
                <a-popconfirm
                  content="确定要删除这个 Gist 吗？"
                  @ok="deleteGist(gist.id)"
                >
                  <a-button
                    status="danger"
                    type="text"
                    :loading="deletingId === gist.id"
                  >
                    <template #icon>
                      <icon-delete />
                    </template>
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
            
            <template v-if="gist.description">
              <div class="gist-description">
                {{ gist.description }}
              </div>
            </template>
            <a-collapse @change="handleCollapseChange">
              <a-collapse-item v-for="(file, filename) in gist.files" :key="filename" :header="String(filename)">
                <template #extra>
                  <a-tag>{{ file.language }}</a-tag>
                </template>
                <div   v-if="fileContents[file.raw_url]">
                  <code-viewer :code="fileContents[file.raw_url]" :language="file.language?.toLowerCase()" />
                </div>
                <a-spin v-else />
              </a-collapse-item>
            </a-collapse>
          </a-card>
        </a-space>
      </a-spin>
    </a-space>

    <div class="float-button-group">
      <div class="float-buttons">
        <a-button shape="circle" type="primary" :loading="loading" @click="refreshGists">
          <template #icon>
            <icon-refresh />
          </template>
        </a-button>
        <a-button shape="circle" type="primary" @click="showCreateModal">
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
        <a-popconfirm
          content="确定要清除 Token 吗？"
          @ok="clearToken"
        >
          <a-button shape="circle" type="outline">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
        </a-popconfirm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { gistApi, type Gist, token } from '../api/gist'
import axios from 'axios'
import CodeViewer from './CodeViewer.vue'
import CreateGistModal from './CreateGistModal.vue'
import { IconRefresh, IconPlus, IconDelete, IconEdit, IconSettings } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { useSubInput } from '../hooks/SubInput'

const { onChanged } = useSubInput('', '搜索 gist', true);

const gists = ref<Gist[]>([])
const originalGists = ref<Gist[]>([])
const loading = ref(true)
const fileContents = ref<Record<string, string>>({})
const deletingId = ref<string | null>(null)
const editingId = ref<string | null>(null)
const createGistModalRef = ref(false)
const expandedKeys = ref<string[]>([])
const editingGist = ref<{
  id: string
  description: string
  public: boolean
  files: Record<string, { content: string; filename?: string }>
} | undefined>(undefined)

onChanged((searchText: string) => {
  if (!searchText) {
    gists.value = originalGists.value;
    return;
  }
  
  const lowerSearchText = searchText.toLowerCase();
  gists.value = originalGists.value.filter(gist => {
    // 搜索 gist 描述
    if (gist.description?.toLowerCase().includes(lowerSearchText)) {
      return true;
    }
    // 搜索文件名
    return Object.keys(gist.files).some(filename => 
      filename.toLowerCase().includes(lowerSearchText)
    );
  });
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadFileContent = async (url: string) => {
  if (fileContents.value[url]) return // 如果已经加载过，就不再重复加载
  try {
    const response = await axios.get(url)
    fileContents.value[url] = response.data
  } catch (error) {
    console.error('Failed to load file content:', error)
    fileContents.value[url] = '加载失败'
  }
}

const handleCollapseChange = (keys: (string | number)[]) => {
  expandedKeys.value = keys.map(key => String(key))
  // 当折叠面板展开时，加载对应的文件内容
  gists.value.forEach((gist: Gist) => {
    Object.values(gist.files).forEach(file => {
      if (expandedKeys.value.includes(file.filename)) {
        loadFileContent(file.raw_url)
      }
    })
  })
}

const refreshGists = async () => {
  loading.value = true
  try {
    const fetchedGists = await gistApi.getGists()
    originalGists.value = fetchedGists
    gists.value = fetchedGists
    
    // 重新加载已展开面板的文件内容
    if (expandedKeys.value.length > 0) {
      gists.value.forEach((gist: Gist) => {
        Object.values(gist.files).forEach(file => {
          if (expandedKeys.value.includes(file.filename)) {
            loadFileContent(file.raw_url)
          }
        })
      })
    }
  } catch (error) {
    console.error('Failed to load gists:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await refreshGists()
})

const openGist = (url: string) => {
  utools.shellOpenExternal(url)
}

const deleteGist = async (id: string) => {
  deletingId.value = id
  try {
    await gistApi.deleteGist(id)
    await refreshGists()
    Message.success('删除成功')
  } catch (error) {
    console.error('Failed to delete gist:', error)
    Message.error(error instanceof Error ? error.message : '删除失败')
  } finally {
    deletingId.value = null
  }
}

const showCreateModal = () => {
  editingGist.value = undefined
  createGistModalRef.value = true
}

const showEditModal = async (gist: Gist) => {
  editingId.value = gist.id
  try {
    // 获取每个文件的内容
    const files: Record<string, { content: string; filename?: string }> = {}
    for (const [filename, file] of Object.entries(gist.files)) {
      try {
        const response = await axios.get(file.raw_url)
        files[filename] = {
          content: response.data,
          filename
        }
      } catch (error) {
        console.error('Failed to load file content:', error)
        Message.error(`无法加载文件 ${filename} 的内容`)
        return
      }
    }

    editingGist.value = {
      id: gist.id,
      public: gist.public,
      description: gist.description,
      files
    }
    createGistModalRef.value = true
  } finally {
    editingId.value = null
  }
}

const clearToken = () => {
  token.value = undefined
  Message.success('Token 已清除')
}
</script>

<style scoped>
.gist-list {
  padding: 16px;
  position: relative;
}

.gist-card {
  width: 80vw;
}

:deep(.arco-collapse-item-content-box) {
  background-color: #f6f8fa;
}

.float-button-group {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
}

.float-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s;
}

.float-buttons:hover {
  transform: translateY(-4px);
}

.gist-description {
  margin-bottom: 16px;
  color: var(--color-text-2);
  white-space: pre-wrap;
  word-break: break-word;
}
</style> 