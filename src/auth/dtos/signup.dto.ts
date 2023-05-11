import {
  IsAlphanumeric,
  IsDefined,
  IsEmail,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class SingUpDto {
  @IsAlphanumeric()
  @IsString()
  @IsDefined()
  username: string;

  @IsEmail()
  @IsDefined()
  email: string;

  @IsStrongPassword({ minLength: 10, minUppercase: 1, minSymbols: 1 })
  password: string;
}
