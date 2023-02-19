export {}

declare global {

    interface User {
        username: string,
        firstName: string,
        lastName: string,
        emailAddress: string,

        autheticated?: boolean,
        dateJoined?: Date,
        lastLogin?: Date,
        authState?: number,
        disableNav?:boolean,
        memberShips: Array<string>
    }
    interface AppUser {
        username: string,
        firstName: string,
        lastName: string,
        emailAddress: string,
    }

}