import axios from 'axios'

export const client = axios.create({
  headers: {
    'X-tenant-id': '1',
  },
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
})
