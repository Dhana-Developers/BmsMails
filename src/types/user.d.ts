export {}

declare global {

    interface User {
        username: string,
        autheticated: boolean,
        firstName: string,
        lastName: string,
        emailAddress: string,
        dateJoined?: Date,
        lastLogin?: Date,
        authState: number,
        memberShips: Array<Membership>,
        disableNav?:boolean
    }

}