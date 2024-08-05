import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'ID of the user', type: 'string' })
  userId: string;

  @ApiProperty({ description: 'Name of the user', type: 'string' })
  name: string;

  @ApiProperty({ description: 'Username of the user', type: 'string' })
  username: string;

  @ApiProperty({ description: 'Age of the user', type: 'number' })
  age: number;

  @ApiProperty({ description: 'Gender of the user', type: 'string' })
  gender: string;

  @ApiProperty({ description: 'Role of the user', type: 'string' })
  role: string;
}
