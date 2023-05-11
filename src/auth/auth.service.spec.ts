import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { MongooseModule } from '@nestjs/mongoose';

import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/User.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

describe('Accounts Service', () => {
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
    await app.close();
    await mongo.stop();
  });

  describe('Basic Signup', () => {
    it('Should create a new account', async () => {
      const account = await authService.signup({
        username: 'testusername',
        email: 'testmail@testmail.com',
        password: 'random/.Password123',
      });

      expect(account).toHaveProperty('token');
      expect(account).toHaveProperty('userId');
    });
  });
});
