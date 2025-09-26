import { User } from '../../pages/users/types'
import api from '../../services/api'

export type Pagination = {
  page: number
  perPage: number
  total: number
}

export type Sorting = {
  sortBy: keyof User | undefined
  sortingOrder: 'asc' | 'desc' | null
}

export type Filters = {
  is_active: boolean
  search: string
}
// Función genérica para convertir snake_case a camelCase
const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Función para normalizar objetos con snake_case a camelCase
const normalizeObject = <T = any>(
  obj: Record<string, any>,
  customTransforms?: Record<string, (obj: any) => any>,
): T => {
  const normalized: any = {}

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key)
    normalized[camelKey] = value
  }

  // Aplicar transformaciones personalizadas
  if (customTransforms) {
    for (const [key, transform] of Object.entries(customTransforms)) {
      normalized[key] = transform(obj)
    }
  }

  return normalized
}

// Transformaciones específicas para usuarios
const userTransforms = {
  first_name: (user: any) => user.first_name || '',
  last_name: (user: any) => user.last_name || '',
  is_active: (user: any) => user.is_active === 1,
}

export const getUsers = async (filters: Partial<Filters & Pagination & Sorting>) => {
  const { is_active, search } = filters

  // Obtener y normalizar usuarios
  const rawUsers: User[] = await fetch(api.allUsers())
    .then((r) => r.json())
    .then((r) => r.data)
  let filteredUsers = rawUsers.map((user: User) => normalizeObject<User>(user, userTransforms))

  console.log('filteredUsers', filteredUsers)

  // Filtros con propiedades normalizadas
  if (is_active !== undefined) {
    filteredUsers = filteredUsers.filter((user: User) => user.is_active)
  }

  if (search) {
    filteredUsers = filteredUsers.filter((user: User) => user.first_name.toLowerCase().includes(search.toLowerCase()))
  }

  const { page = 1, perPage = 10 } = filters || {}
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  return {
    data: paginatedUsers,
    pagination: {
      page,
      perPage,
      total: filteredUsers.length,
    },
  }
}

export const addUser = async (user: User) => {
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')

  const result = await fetch(api.allUsers(), { method: 'POST', body: JSON.stringify(user), headers }).then((r) =>
    r.json(),
  )

  if (!result.error) {
    return result
  }

  throw new Error(result.error)
}

export const updateUser = async (user: User) => {
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')

  const result = await fetch(api.user(user.id), { method: 'PUT', body: JSON.stringify(user), headers }).then((r) =>
    r.json(),
  )

  if (!result.error) {
    return result
  }

  throw new Error(result.error)
}

export const removeUser = async (user: User) => {
  return fetch(api.user(user.id), { method: 'DELETE' })
}

export const uploadAvatar = async (body: FormData) => {
  return fetch(api.avatars(), { method: 'POST', body, redirect: 'follow' }).then((r) => r.json())
}
