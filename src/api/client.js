// Created: 2026-04-08 23:13:24
import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
      return Promise.reject(err)
    }
    const message = err.response?.data?.message || '알 수 없는 오류가 발생했습니다.'
    window.dispatchEvent(new CustomEvent('app:error', { detail: message }))
    return Promise.reject(err)
  },
)

export default client
