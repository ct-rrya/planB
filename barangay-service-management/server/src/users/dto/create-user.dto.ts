import { IsString, IsNotEmpty, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(['admin', 'super_admin'])
  role: string;
}
