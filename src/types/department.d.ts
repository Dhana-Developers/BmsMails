export {}

declare global{

    interface Department{
        departmentID: string,
        departmentName: string,
        departmentOrganization: string,
        departmentMembers: Array<any>,
        state: number,
        mailAccount: string
        recruiting?: boolean,
        departmentMailAccounts?: Array<MailAccount>
    }

}