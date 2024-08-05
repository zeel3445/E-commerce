import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ description: 'name of user', type: 'string' })
  @IsNotEmpty()
  @IsString()
  //   @ApiProperty()
  name: string;
  //   @ApiProperty()
  @IsString()
  @ApiProperty({ description: 'user username', type: 'string' })
  @IsNotEmpty()
  username: string;
  @ApiProperty({ description: 'user password', type: 'string' })
  @IsNotEmpty()
  @IsString()
  password: string;
  @ApiProperty({ description: 'user age', type: 'number' })
  @IsNotEmpty()
  @IsNumber()
  age: number;
  @ApiProperty({ description: 'user gender', type: 'string' })
  @IsNotEmpty()
  @IsString()
  gender: string;
  @ApiProperty({ description: 'user role', type: 'string' })
  @IsNotEmpty()
  @IsString()
  role: string;
}
