import { IsEmail, IsString } from "class-validator";
import { Service } from "typedi";

@Service()
export default class RegisterOrLoginUserRequestDto {
    @IsEmail()
    email!: string;
    
    @IsString()
    password!: string;
}