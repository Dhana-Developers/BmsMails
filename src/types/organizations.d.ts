export{}

declare global {

    interface Organization {

        orgDomain: string,
        orgName: string,
        orgMailServer: string,//deprecated
        orgCreator: string,
        state: number,

    }

}