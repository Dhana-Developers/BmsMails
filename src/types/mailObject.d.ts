export {}

declare global{
    interface MailObject {
        userAccount: string,
        mailLabel?: string,
        mailBox?: string,
        mailFlag: string,
        mailObjectId: number
    }
}