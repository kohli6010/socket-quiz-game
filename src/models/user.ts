import { prop, getModelForClass, pre } from '@typegoose/typegoose';
import { IsString, IsEmail } from 'class-validator';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Service } from 'typedi';

@pre<User>('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
})

@Service()
export class User {

    _id: Types.ObjectId;

    @prop({ required: true, unique: true })
    @IsEmail()
    email!: string;

    @prop({ required: true })
    @IsString()
    password!: string;

    public async comparePassword(enteredPassword: string): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, this.password);
    }
}

export const UserModel = getModelForClass(User);
