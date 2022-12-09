export {}

declare global {

    interface Membership{
        memberId: string,
        memberUserId: string,
        memberDateJoined: Date,
        departmentId: string,
        departmentName: string,
        organizationId: string,
        organizationName: string,
        organizationMail: string,
        organizationCreator: string,
        organizationDepartments: Array<Department>,
        departmentMembers?:Array<any>
    }

}