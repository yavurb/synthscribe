import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/User.schema';

import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

import { SingInDto, SingUpDto } from './dtos';
import { UserPayload } from './interfaces';
import { UserFilters } from './types';
import { ApiKey } from './schemas';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  private APIKEY_PREFIX = this.configService.get<string>('APIKEY_PREFIX');

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
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);

    const passwordHash = await bcrypt.hash(userInfo.password, 10);
    const user = new this.userModel({
      email: userInfo.email,
      username: userInfo.username,
      password: passwordHash,
    });

    const newUser = (await user.save()).toJSON();

    const payload: UserPayload = {
      userId: newUser._id.toString(),
      role: newUser.role,
    };
    const token = await this.jwtService.signAsync(payload);

    return { token, userId: newUser._id.toString() };
  }

  async signin(singinInfo: SingInDto): Promise<{ token: string }> {
    const user = await this.userModel
      .findOne({ email: singinInfo.email })
      .exec();
    if (!user)
      throw new HttpException('User do not exists', HttpStatus.NOT_FOUND);

    const passwordMathed = await bcrypt.compare(
      singinInfo.password,
      user.password,
    );
    if (!passwordMathed)
      throw new HttpException('Password do not match', HttpStatus.BAD_REQUEST);

    const sessinPayload: UserPayload = {
      userId: user._id.toString(),
      role: user.role,
    };
    const token = await this.jwtService.signAsync(sessinPayload);

    return { token };
  }

  async getApiToken(
    userId: string,
  ): Promise<{ apikey: string; message: string }> {
    // * Constrainst
    const user = await this.userModel.findOne({ _id: userId }).exec();
    if (!user) throw new NotFoundException();

    const existingApiKey = await this.apiKeyModel.findOne({
      user: user._id,
      active: true,
    });
    if (existingApiKey) {
      throw new BadRequestException(
        'An API key is already active. You must delete the current API key to create a new one',
      );
    }

    const { rawKey, hashedKey } = await this.genereteKey();
    const apiKey = new this.apiKeyModel({
      key: hashedKey,
      lastFourDigits: rawKey.slice(rawKey.length - 4),
      prefix: this.APIKEY_PREFIX,
      user: user._id,
    });
    await apiKey.save();

    return {
      apikey: `${this.APIKEY_PREFIX}.${rawKey}`,
      message: 'Secure store this key, you will not see this key again.',
    };
  }

  private async genereteKey(
    size = 64,
  ): Promise<{ rawKey: string; hashedKey: string }> {
    const keyBuffer = randomBytes(size);
    const keyString = keyBuffer.toString('base64');

    const hashedKey = await bcrypt.hash(keyString, 10);

    return { rawKey: keyString, hashedKey: hashedKey };
  }
}
