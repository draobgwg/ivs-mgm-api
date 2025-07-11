export interface User {
    id: number;
    name: string;
    password: string;
    createdTs?: Date;
    updated_ts?: Date;
}

export interface UserForm {
    id?: number;
    name: string;
    phone_number: string;
    code?: string;
    createdTs?: Date;
    updated_ts?: Date;
}
