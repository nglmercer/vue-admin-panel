import BaseApi from './commons/BaseApi'
import type { FetchOptions } from './commons/httpservice'
import apiConfig from './config/apiConfig'
import { emitter } from '../Emitter'
import { LoginApi } from './login'
export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  roles: string[]
  is_active: boolean
  created_at: string
  lastLoginAt?: string
  updated_at?: string
}

export interface AdminPost {
  id: string
  title: string
  content: string
  authorId: string
  authorEmail: string
  created_at: string
  updated_at: string
  published: boolean
}

export interface AdminResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface UsersResponse extends AdminResponse {
  users?: AdminUser[]
  total?: number
}

export interface UserResponse extends AdminResponse {
  user?: AdminUser
}

export interface PostsResponse extends AdminResponse {
  posts?: AdminPost[]
  total?: number
}

export interface StatsResponse extends AdminResponse {
  stats?: {
    users: {
      total: number
      active: number
      inactive: number
    }
    posts: {
      total: number
      published: number
      draft: number
    }
  }
}

export interface UpdateUserData {
  email?: string
  first_name?: string
  last_name?: string
  is_active?: boolean
}

export interface RoleAssignment {
  roleName: string
}

export interface Role {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  isDefault?: boolean
  is_active: boolean
  permissions: Permission[]
}

export interface RolesResponse extends AdminResponse {
  roles?: Role[]
}
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
  created_at: string
  updated_at: string
}

export interface PermissionsResponse extends AdminResponse {
  permissions?: Permission[]
  data?: Permission[]
}
export interface PasswordChangeData {
  newPassword: string
}

class AdminApi extends LoginApi {
  constructor(config: any) {
    super(config)
  }

  // User Management Methods
  async getAllUsers(): Promise<UsersResponse> {
    try {
      const response = await this.get<UsersResponse>('/api/admin/users')

      if (response.success) {
        emitter.emit('admin:users:success', { users: response.users, total: response.total })
      } else {
        emitter.emit('admin:users:error', { message: response.message || 'Failed to fetch users' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:users:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async getUserById(id: string): Promise<UserResponse> {
    try {
      const response = await this.get<UserResponse>(`/api/admin/users/${id}`)

      if (response.success) {
        emitter.emit('admin:user:success', { user: response.user })
      } else {
        emitter.emit('admin:user:error', { message: response.message || 'Failed to fetch user' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<UserResponse> {
    try {
      const response = await this.put<UserResponse>(`/api/admin/users/${id}`, userData)

      if (response.success) {
        emitter.emit('admin:user:update:success', { user: response.user })
      } else {
        emitter.emit('admin:user:update:error', { message: response.message || 'Failed to update user' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:update:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async deactivateUser(id: string): Promise<AdminResponse> {
    try {
      const response = await this.put<AdminResponse>(`/api/admin/users/${id}/deactivate`)

      if (response.success) {
        emitter.emit('admin:user:deactivate:success', { userId: id })
      } else {
        emitter.emit('admin:user:deactivate:error', { message: response.message || 'Failed to deactivate user' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:deactivate:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async activateUser(id: string): Promise<AdminResponse> {
    try {
      const response = await this.put<AdminResponse>(`/api/admin/users/${id}/activate`)

      if (response.success) {
        emitter.emit('admin:user:activate:success', { userId: id })
      } else {
        emitter.emit('admin:user:activate:error', { message: response.message || 'Failed to activate user' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:activate:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async deleteUser(id: string): Promise<AdminResponse> {
    try {
      const response = await this.delete<AdminResponse>(`/api/admin/users/${id}`)

      if (response.success) {
        emitter.emit('admin:user:delete:success', { userId: id })
      } else {
        emitter.emit('admin:user:delete:error', { message: response.message || 'Failed to delete user' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:delete:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Role Management Methods
  async getUserRoles(userId: string): Promise<RolesResponse> {
    try {
      const response = await this.get<RolesResponse>(`/api/admin/users/${userId}/roles`)

      if (response.success) {
        emitter.emit('admin:user:roles:success', { userId, roles: response.roles })
      } else {
        emitter.emit('admin:user:roles:error', { message: response.message || 'Failed to fetch user roles' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:roles:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async assignRole(userId: string, roleData: RoleAssignment): Promise<AdminResponse> {
    try {
      const response = await this.post<AdminResponse>(`/api/admin/users/${userId}/roles`, roleData)

      if (response.success) {
        emitter.emit('admin:role:assign:success', { userId, roleName: roleData.roleName })
      } else {
        emitter.emit('admin:role:assign:error', { message: response.message || 'Failed to assign role' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:role:assign:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async removeRole(userId: string, roleName: string): Promise<AdminResponse> {
    try {
      const response = await this.delete<AdminResponse>(`/api/admin/users/${userId}/roles/${roleName}`)

      if (response.success) {
        emitter.emit('admin:role:remove:success', { userId, roleName })
      } else {
        emitter.emit('admin:role:remove:error', { message: response.message || 'Failed to remove role' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:role:remove:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Authentication Management Methods
  async forceLogout(userId: string): Promise<AdminResponse> {
    try {
      const response = await this.post<AdminResponse>(`/api/admin/users/${userId}/logout`, {})

      if (response.success) {
        emitter.emit('admin:user:logout:success', { userId })
      } else {
        emitter.emit('admin:user:logout:error', { message: response.message || 'Failed to logout user' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:logout:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async resetPassword(userId: string): Promise<AdminResponse> {
    try {
      const response = await this.post<AdminResponse>(`/api/admin/users/${userId}/reset-password`, {})

      if (response.success) {
        emitter.emit('admin:user:password:reset:success', { userId })
      } else {
        emitter.emit('admin:user:password:reset:error', { message: response.message || 'Failed to reset password' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:password:reset:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async changePassword(userId: string, passwordData: PasswordChangeData): Promise<AdminResponse> {
    try {
      const response = await this.put<AdminResponse>(`/api/admin/users/${userId}/password`, passwordData)

      if (response.success) {
        emitter.emit('admin:user:password:change:success', { userId })
      } else {
        emitter.emit('admin:user:password:change:error', { message: response.message || 'Failed to change password' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:user:password:change:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Content Management Methods
  async getAllPosts(): Promise<PostsResponse> {
    try {
      const response = await this.get<PostsResponse>('/api/admin/posts')

      if (response.success) {
        emitter.emit('admin:posts:success', { posts: response.posts, total: response.total })
      } else {
        emitter.emit('admin:posts:error', { message: response.message || 'Failed to fetch posts' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:posts:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // System Statistics Methods
  async getSystemStats(): Promise<StatsResponse> {
    try {
      const response = await this.get<StatsResponse>('/api/admin/stats')

      if (response.success) {
        emitter.emit('admin:stats:success', { stats: response.stats })
      } else {
        emitter.emit('admin:stats:error', { message: response.message || 'Failed to fetch stats' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:stats:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  // Utility Methods
  isAdminAuthenticated(): boolean {
    const user = this.getCurrentUser()
    return this.isAuthenticated()
  }

  getCurrentUser(): AdminUser | null {
    return this.user && Object.keys(this.user).length > 0 ? (this.user as AdminUser) : null
  }
}
class RolesApi extends LoginApi {
  async getRoles(): Promise<RolesResponse> {
    try {
      const response = await this.get<RolesResponse>('/api/admin/roles')

      if (response.success) {
        emitter.emit('admin:roles:success', { roles: response.roles })
      } else {
        emitter.emit('admin:roles:error', { message: response.message || 'Failed to fetch roles' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:roles:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }
  async createRole({ name, permissions }: { name: string; permissions: string[] }): Promise<RolesResponse> {
    try {
      const response = await this.post<RolesResponse>('/api/admin/roles', { name, permissions })

      if (response.success) {
        emitter.emit('admin:role:create:success', { role: response.data })
      } else {
        emitter.emit('admin:role:create:error', { message: response.message || 'Failed to create role' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:role:create:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }
  async updateRole({
    id,
    name,
    permissions,
  }: {
    id: string
    name: string
    permissions: string[]
  }): Promise<RolesResponse> {
    try {
      const response = await this.put<RolesResponse>(`/api/admin/roles/${id}`, { name, permissions })

      if (response.success) {
        emitter.emit('admin:role:update:success', { role: response.data })
      } else {
        emitter.emit('admin:role:update:error', { message: response.message || 'Failed to update role' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:role:update:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }
  async deleteRole(id: string): Promise<RolesResponse> {
    try {
      const response = await this.delete<RolesResponse>(`/api/admin/roles/${id}`)

      if (response.success) {
        emitter.emit('admin:role:delete:success', { id })
      } else {
        emitter.emit('admin:role:delete:error', { message: response.message || 'Failed to delete role' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:role:delete:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }
  async getPermissions(): Promise<PermissionsResponse> {
    try {
      const response = await this.get<PermissionsResponse>('/api/admin/permissions')
      console.log('response. getPermissions', response)
      if (response.success) {
        // Handle both possible response formats
        const permissions = response.data || response.permissions || []
        emitter.emit('admin:permissions:success', { permissions })
        return { ...response, data: permissions, permissions }
      } else {
        emitter.emit('admin:permissions:error', { message: response.message || 'Failed to fetch permissions' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('admin:permissions:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }
}
const adminApi = new AdminApi(apiConfig)
const rolesApi = new RolesApi(apiConfig)
export { adminApi, rolesApi }
