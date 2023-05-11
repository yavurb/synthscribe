import { Test, TestingModule } from '@nestjs/testing';

import { AccountsService } from './accounts.service';
import { INestApplication } from '@nestjs/common';

describe('Accounts Service', () => {
  let app: INestApplication;
  let accountsService: AccountsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    accountsService = app.get<AccountsService>(AccountsService);
  });

  // describe('generateToken', () => {
  //   it('should generate a token with 20 characters long', async () => {
  //     const token = accountsService.generateToken();
  //     expect(token).toHaveLength(20);
  //   });
  // });
});
