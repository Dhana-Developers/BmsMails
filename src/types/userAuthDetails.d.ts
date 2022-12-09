export {}

declare global {

    interface AuthDetails {

        username: string,
        firstName?: string,
        lastName?: string,
        emailAddress?: string,
        password: string

    }

}