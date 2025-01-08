import axios from 'axios'
import { ref, watch } from 'vue'

const BASE_URL = 'https://api.github.com'
const TOKEN_KEY = 'utools-gist-token'
const storage = utools.dbCryptoStorage ?? utools.dbStorage
export const token = ref<string|undefined>(storage.getItem(TOKEN_KEY))
if(!token.value){
  // 兼容旧版本
  try {
    const oldToken = utools.dbStorage.getItem(TOKEN_KEY)
    if (oldToken) {
      token.value = oldToken
      // 迁移到新存储
      storage.setItem(TOKEN_KEY, oldToken)
      // 删除旧存储
      utools.dbStorage.removeItem(TOKEN_KEY)
    }
  } catch (error) {
    console.error('获取旧版本 token 失败:', error)
  }
}

watch(token, (newToken:string|undefined) => {
  try {
    if(newToken){
      storage.setItem(TOKEN_KEY, newToken)
    }else{
      storage.removeItem(TOKEN_KEY)
      // 同时确保旧存储也被清理
      if (utools.dbStorage !== storage) {
        utools.dbStorage.removeItem(TOKEN_KEY)
      }
    }
    updateToken()
  } catch (error) {
    console.error('token 存储操作失败:', error)
  }
})
// 禁用缓存
axios.defaults.headers.common['Cache-Control'] = 'no-cache'
axios.defaults.headers.common['Pragma'] = 'no-cache'
if(token.value){
  updateToken()
}


export interface Gist {
  id: string
  public: boolean
  description: string
  url: string
  html_url: string
  created_at: string
  updated_at: string
  files: {
    [key: string]: {
      filename: string
      raw_url: string
      type: string
      language: string
      size: number
    }
  }
}

function updateToken() {
  if(token.value){
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }else{
    delete axios.defaults.headers.common['Authorization']
  }
}


export const gistApi = {
  // 获取 Gists 列表
  getGists: async () => {
    const response = await axios.get(`${BASE_URL}/gists`)
    return response.data as Gist[]
  },

  // 创建新的 Gist
  createGist: async (data: {
    description: string
    files: { [key: string]: { content: string } }
    public: boolean
  }) => {
    const response = await axios.post(`${BASE_URL}/gists`, data)
    return response.data as Gist
  },

  // 更新 Gist
  updateGist: async (id: string, data: {
    description?: string
    files: { [key: string]: { content: string } | null }
  }) => {
    const response = await axios.patch(`${BASE_URL}/gists/${id}`, data)
    return response.data as Gist
  },

  // 删除 Gist
  deleteGist: async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/gists/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('找不到要删除的 Gist，可能是因为 token 权限不足或者 Gist 不存在')
        } else if (error.response?.status === 401) {
          throw new Error('认证失败，请检查 token 是否有效')
        } else if (error.response?.status === 403) {
          throw new Error('没有权限执行此操作，请确保 token 有足够的权限')
        }
        throw new Error(`删除失败: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }
} 