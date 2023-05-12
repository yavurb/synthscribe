import { IsDefined, IsEmail, IsString } from 'class-validator';

export class SingInDto {
  @IsEmail()
  @IsDefined()
  email: string;

  @IsDefined()
  @IsString()
  password: string;
}
