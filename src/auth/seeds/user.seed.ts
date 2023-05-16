import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/User.schema';
import { Model } from 'mongoose';
import { SingUpDto } from '../dtos';

@Injectable()
export class UserSeed {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  userID: string;
  userInfo: SingUpDto = {
    email: 'useremail@testmail.com',
    username: 'tempuser',
    password: 'TestPassword123.',
  };

  async injectUser(): Promise<UserDocument> {
    const newUser = await new this.userModel({
      ...this.userInfo,
    }).save();

    this.userID = newUser._id.toString();

    return newUser;
  }
}
