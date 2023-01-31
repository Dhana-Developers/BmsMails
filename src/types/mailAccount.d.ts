export {}

declare global{
    interface MailAccount{
        hostLoginAddress:string,
        disableMail?: boolean // deprecated
        name: string,
        accountType: string
    }
}