import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserModel } from 'src/models/user.model';
import { PostgresService } from 'src/services/pg.services';
import { hash, compare } from 'bcrypt';
import { redisClient } from 'src/services/redis.service';
import { JwtService } from '@nestjs/jwt';
import { writeFileSync } from 'fs';
import { randomInt } from 'crypto';
import { createJwtPayload } from './jwtinterface';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly postgress: PostgresService
  ) {}
  async register(
    name: string,
    username: string,
    password: string,
    age: number,
    gender: string,
    role: string
  ): Promise<any> {
    return this.createUser(name, username, password, age, gender, role);
  }
  async createUser(
    name: string,
    username: string,
    password: string,
    age: number,
    gender: string,
    role: string
  ): Promise<any> {
    try {
      const data = {
        name,
        username,
        password,
        age,
        gender,
        role,
      };

      const existinguser = await UserModel.getFromUsername(
        this.postgress,
        username
      );
      if (existinguser) {
        const err = 'user already exists';
        throw new ConflictException(err);
      }

      const val = await UserModel.build(data);
      const hashedPassword = await hash(password, 10);
      val.password = hashedPassword;
      await val.save(this.postgress);
      return await val.giveSanitizedData();
    } catch (error) {
      throw error;
    }
  }
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      const err = 'Invalid credentials';
      throw new UnauthorizedException(err);
    }

    const payload = createJwtPayload(user);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string): Promise<any> {
    let user;
    user = await redisClient.get(`user:${username}`);
    console.log(user);

    let userobj;
    if (!user) {
      userobj = await this.findOne(username);

      if (userobj) {
        await redisClient.set(`user:${username}`, JSON.stringify(userobj));
        user = userobj;
      }
    } else {
      user = JSON.parse(user);
    }

    console.log(user);
    console.log(userobj);
    console.log(user.password);

    if (user && (await this.comparePasswords(password, user.password))) {
      return user;
    }

    return null;
  }
  async findOne(username: string): Promise<any | undefined> {
    const user = await UserModel.getFromUsername(this.postgress, username);
    if (!user) {
      const err = 'User not found or not enabled';
      throw new NotFoundException(err);
    }
    return user;
  }
  async comparePasswords(
    password: string,
    hashedPassword: any
  ): Promise<boolean> {
    try {
      console.log('compare');
      console.log(password);
      console.log(hashedPassword);
      const val = await compare(password, hashedPassword);
      console.log(val);
      return val;
    } catch (error) {
      console.error('Error in comparePasswords:', error);
      const err = 'Failed to compare passwords';
      throw new BadRequestException(err);
    }
  }
  async resetPassword(
    username: string,
    oldpassword: string,
    newpassword: string
  ): Promise<any> {
    try {
      try {
        const veri = new UserModel();
        veri.password = newpassword;
        await UserModel.build(veri);
      } catch (err) {
        throw err;
      }

      console.log(oldpassword);
      console.log(newpassword);
      const user = await this.findOne(username);
      console.log(user);
      if (!user) {
        const err = 'User not found';
        throw new NotFoundException(err);
      }

      // Verify the old password
      console.log(oldpassword);
      console.log(user.password);
      const isOldPasswordValid = await compare(oldpassword, user.password);
      console.log(isOldPasswordValid);
      if (!isOldPasswordValid) {
        const err = 'Old password is incorrect';
        throw new BadRequestException(err);
      }

      console.log(user.password);
      const val = await UserModel.build(user);
      val.password = await hash(newpassword, 10);
      await redisClient.del(`user:${username}`);
      // user = JSON.stringify(user);
      await redisClient.set(`user:${username}`, JSON.stringify(val));
    } catch (error) {
      return error;
    }
  }
  async generateResetCode(username: string): Promise<string> {
    const user = await this.findOne(username);
    if (!user || user.deleted) {
      const err = 'User not found or is deleted';
      throw new Error(err);
    }

    const resetCode = randomInt(100000, 999999).toString();

    await redisClient.set(username, resetCode);

    writeFileSync('reset-codes.txt', `${username}: ${resetCode}\n`, {
      flag: 'a',
    });

    return resetCode;
  }
  async verifyResetCode(username: string, code: string) {
    const storedCode = await redisClient.get(username);
    console.log('inside storedcode');
    console.log(storedCode);

    return storedCode === code;
  }
  async resetforgotpassword(
    username: string,
    code: string,
    newpassword: string
  ): Promise<void> {
    try {
      const veri = new UserModel();
      veri.password = newpassword;
      await UserModel.build(veri);
    } catch (err) {
      throw err;
    }
    let user = new UserModel();
    user = await this.findOne(username);
    console.log(user);
    if (!user) {
      const err = 'User not found';
      throw new NotFoundException(err);
    }
    const isCodeValid = await this.verifyResetCode(username, code);
    console.log('verified');
    if (!isCodeValid) {
      const err = 'Invalid  reset code';
      throw new Error(err);
    }
    console.log('bow it going for updation');
    console.log(user.password);
    console.log(newpassword);
    user.password = await hash(newpassword, 10);
    console.log(user);
    await redisClient.del(`user:${username}`);

    await user.save(this.postgress);
  }
  async logout(username: string, token: string) {
    try {
      console.log('inlogout');
      const decoded = this.jwtService.decode(token) as { exp: number };
      console.log('checking decoded');
      console.log(decoded);
      if (!decoded || !decoded.exp) {
        throw new UnauthorizedException('Invalid token');
      }

      await redisClient.sAdd(`blacklist:${username}`, token);
      const msg = 'Logged out successfully';
      return { message: msg };
    } catch (error) {
      console.error('Error in logout:', error);
      const err = 'Failed to logout';
      throw new UnauthorizedException(err);
    }
  }
  async isTokenBlacklisted(username: string, token: string): Promise<boolean> {
    console.log('inblacklistotken');
    const isBlacklisted = await redisClient.sIsMember(
      `blacklist:${username}`,
      token
    );
    console.log(isBlacklisted);
    if (isBlacklisted) return isBlacklisted;
    else {
      return;
    }
  }
}
