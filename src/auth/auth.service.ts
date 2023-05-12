import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/User.schema';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { SingUpDto } from './dtos';
import { UserFilters } from './types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  private async lookupAccount(filters: UserFilters): Promise<UserDocument> {
    const filterKeys = Object.keys(filters);
    const filterArray = filterKeys.map((key) => ({
      [key]: filters[key],
    }));

    return this.userModel
      .findOne({
        $or: filterArray,
      })
      .select(filterKeys.join(' '))
      .lean();
  }

  async signup(
    userInfo: SingUpDto,
  ): Promise<{ token: string; userId: string }> {
    // * Guard Statements
    if (await this.lookupAccount({ username: userInfo.username }))
      throw new HttpException(
        'Username already exists',
        HttpStatus.BAD_REQUEST,
      );
    if (await this.lookupAccount({ email: userInfo.email }))
      throw new HttpException('Emails already exists', HttpStatus.BAD_REQUEST);

    const passwordHash = await bcrypt.hash(userInfo.password, 10);
    const user = new this.userModel({
      email: userInfo.email,
      username: userInfo.username,
      password: passwordHash,
    });

    const newUser = (await user.save()).toJSON();

    const token = await this.jwtService.signAsync({ userId: newUser._id });

    return { token, userId: newUser._id.toString() };
  }
}
