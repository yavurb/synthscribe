import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/User.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('Auth Service', () => {
  let app: INestApplication;
  let authService: AuthService;
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(mongo.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({
          secret: 'RANDOMSECRET',
          signOptions: { expiresIn: '7d' },
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    authService = app.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await mongo.stop();
    await app.close();
  });

  describe('Basic Signup', () => {
    const userInfo = {
      username: 'testusername',
      email: 'testmail@testmail.com',
      password: 'random/.Password123',
    };

    it('Should create a new account', async () => {
      const account = await authService.signup(userInfo);

      expect(account).toHaveProperty('token');
      expect(account).toHaveProperty('userId');
    });

    it('Should throw an error if username already exist', async () => {
      expect(
        authService.signup({
          ...userInfo,
          email: 'anotheremail@testmail.com',
        }),
      ).rejects.toThrow('Username already exists');
    });

    it('Should throw an error if email already exist', async () => {
      expect(
        authService.signup({
          ...userInfo,
          username: 'anotherusername',
        }),
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('Basic Signin', () => {
    const userInfo = {
      email: 'testmail@testmail.com',
      password: 'random/.Password123',
    };

    it('Should signin an existing user', async () => {
      const user = await authService.signin(userInfo);

      expect(user).toHaveProperty('token');
    });

    it('Should throw an error if user does not exits', () => {
      expect(
        authService.signin({
          email: 'wrongemail@testmail.com',
          password: '',
        }),
      ).rejects.toThrow('User do not exists');
    });

    it('Should throw if password is incorrect', () => {
      expect(
        authService.signin({
          ...userInfo,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Password do not match');
    });
  });
});
