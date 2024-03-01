export interface User {
    id?: string; 
    username: string;
    email: string;
    password: string;
}

export interface UnitUser extends User {}

export interface Users {
    [key: string]: UnitUser;
}

