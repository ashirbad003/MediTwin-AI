const ACCESS_TOKEN_KEY = 'meditwin_access_token'
const REFRESH_TOKEN_KEY = 'meditwin_refresh_token'
const USER_KEY = 'meditwin_user'

export const setAuthData = (accessToken, refreshToken, user) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY)

  return user ? JSON.parse(user) : null
}

export const clearAuthData = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const isAuthenticated = () => {
  return Boolean(getAccessToken())
}