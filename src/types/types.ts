export type AuthVariantsType = 'VK' | 'Email' | 'Phone number' | 'Google'

export interface IInquirerAuthRes {
    authMethod: AuthVariantsType
}
