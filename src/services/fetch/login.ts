import BaseApi from './commons/BaseApi'
import type { FetchOptions } from './commons/httpservice'
import apiConfig from './config/apiConfig'
import { emitter } from '../Emitter'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  success: boolean
  data?: {
    token?: string
    refreshToken?: string
    user?: User
  }
  token?: string
  refreshToken?: string
  user?: User
  message?: string
  error?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
}

class LoginApi extends BaseApi {
  constructor(config: any) {
    super(config)
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/auth/login', credentials)

      if (response.success && (response.token || response.data?.token)) {
        this.token = response.token || response.data?.token
        this.user = response.user || {}

        // Store in localStorage
        localStorage.setItem('token', response.token || response.data?.token || '')
        localStorage.setItem('refreshToken', response.refreshToken || response.data?.refreshToken || '')
        localStorage.setItem('user', JSON.stringify(response.user || response.data?.user || {}))
        localStorage.setItem(
          'info',
          JSON.stringify({
            token: response.token || response.data?.token || '',
            refreshToken: response.refreshToken || response.data?.refreshToken || '',
            user: response.user || response.data?.user || {},
          }),
        )

        // Emit login success event
        emitter.emit('auth:login:success', {
          user: response.user || response.data?.user || {},
          token: response.token || response.data?.token || '',
        })
      } else {
        emitter.emit('auth:login:error', { message: response.message || 'Login failed' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('auth:login:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>('/auth/register', userData)

      if (response.success && response.token) {
        this.token = response.token
        this.user = response.user || {}

        // Store in localStorage
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem(
          'info',
          JSON.stringify({
            token: response.token,
            user: response.user,
          }),
        )

        // Emit register success event
        emitter.emit('auth:register:success', { user: response.user, token: response.token })
      } else {
        emitter.emit('auth:register:error', { message: response.message || 'Registration failed' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('auth:register:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  async logout(): Promise<void> {
    this.token = undefined
    this.user = {}

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('info')

    // Emit logout event
    emitter.emit('auth:logout', {})
  }

  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await this.get<AuthResponse>('/auth/profile')

      if (response.success) {
        this.user = response.user || {}
        emitter.emit('auth:profile:success', { user: response.user })
      } else {
        emitter.emit('auth:profile:error', { message: response.message || 'Failed to get profile' })
      }

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error'
      emitter.emit('auth:profile:error', { message: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  getCurrentUser(): User | null {
    return this.user && Object.keys(this.user).length > 0 ? (this.user as User) : null
  }
  async refreshToken(refreshToken: string = this.token || ''): Promise<AuthResponse> {
    try {
      // Make refresh token request
      const response = await this.post<AuthResponse>('/auth/refresh', { refreshToken })

      // Handle successful response
      if (response.success && response.token) {
        await this.updateAuthState(response)
      }

      return response
    } catch (error) {
      return this.handleRefreshError(error)
    }
  }

  private async updateAuthState(response: AuthResponse): Promise<void> {
    // Update instance state
    this.token = response.token
    this.user = response.user || {}

    // Update local storage
    const authData = {
      token: response.token,
      user: response.user,
    }
    if (response.token) {
      localStorage.setItem('token', response.token)
      this.token = response.token
    }
    localStorage.setItem('user', JSON.stringify(response.user))
    localStorage.setItem('info', JSON.stringify(authData))
  }

  private handleRefreshError(error: unknown): AuthResponse {
    const errorMessage = error instanceof Error ? error.message : 'Network error'
    emitter.emit('auth:refresh:error', { message: errorMessage })
    return { success: false, error: errorMessage }
  }
}

const loginApi = new LoginApi(apiConfig)
export { LoginApi, loginApi }
