import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    AccountsModule,
    ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
