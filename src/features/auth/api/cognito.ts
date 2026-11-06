import { Amplify } from 'aws-amplify'
import { confirmResetPassword, confirmSignUp, fetchAuthSession, resetPassword, signIn, signInWithRedirect, signOut, signUp, updatePassword } from 'aws-amplify/auth'

const cognito = {
  userPoolId: 'ap-southeast-2_iUMERg77o',
  userPoolClientId: '10ivodmqmsklu4gqkqj1qcgr0h',
}

const origin = window.location.origin
const oauthDomain = 'ap-southeast-2iumerg77o.auth.ap-southeast-2.amazoncognito.com'

Amplify.configure({ Auth: { Cognito: { ...cognito, loginWith: { email: true, oauth: { domain: oauthDomain, scopes: ['openid', 'email', 'profile'], redirectSignIn: [`${origin}/login`], redirectSignOut: [`${origin}/login`], responseType: 'code', providers: ['Google'] } } } } })

export const cognitoAuth = {
  async token(): Promise<string | null> {
    try { return (await fetchAuthSession()).tokens?.accessToken?.toString() ?? null } catch { return null }
  },
  async login(email: string, password: string) {
    return signIn({ username: email.trim().toLowerCase(), password })
  },
  async register(email: string, password: string, name: string, phone: string) {
    return signUp({ username: email.trim().toLowerCase(), password, options: { userAttributes: { email: email.trim().toLowerCase(), name, phone_number: phone } } })
  },
  async confirm(email: string, code: string) {
    return confirmSignUp({ username: email.trim().toLowerCase(), confirmationCode: code })
  },
  async logout() { await signOut() },
  async loginWithGoogle() { await signInWithRedirect({ provider: 'Google' }) },
  async requestPasswordReset(email: string) { return resetPassword({ username: email.trim().toLowerCase() }) },
  async confirmPasswordReset(email: string, code: string, newPassword: string) { return confirmResetPassword({ username: email.trim().toLowerCase(), confirmationCode: code, newPassword }) },
  async changePassword(oldPassword: string, newPassword: string) { return updatePassword({ oldPassword, newPassword }) },
}
