// Legacy AWS Amplify Cognito integration stub (Ellora uses self-managed JWT HS256 auth via /api/v1/auth)
export const cognitoAuth = {
  async token(): Promise<string | null> { return null },
  async login(_email: string, _password: string) { return {} },
  async register(_email: string, _password: string, _name: string, _phone: string) { return {} },
  async confirm(_email: string, _code: string) { return {} },
  async logout() {},
  async loginWithGoogle() {},
  async requestPasswordReset(_email: string) { return {} },
  async confirmPasswordReset(_email: string, _code: string, _newPassword: string) { return {} },
  async changePassword(_oldPassword: string, _newPassword: string) { return {} },
}
