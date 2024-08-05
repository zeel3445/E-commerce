import { PostgresService } from 'src/services/pg.services';
import { redisClient, set } from 'src/services/redis.service';
import { v4 as uuidv4 } from 'uuid';
import * as jf from 'joiful';
import { password1 } from './customdecorators';
import { BadRequestException } from '@nestjs/common';

export class UserModel {
  //@(jf.string().min(9))
  @password1()
  password: string;

  @jf.string()
  UserId: string;
  // @jf.string().min(8)
  name: string;
  @jf.string()
  username: string;

  @jf.string()
  oldpassword: string;

  newpassword: string;

  @jf.string()
  code: string;
  @jf.number()
  age: number;
  @jf.string()
  gender: string;
  @jf.string()
  role: string;
  @jf.date()
  createdDt: Date = new Date();
  @jf.boolean()
  enabled: boolean;
  postgress: PostgresService;

  toJSON(dataOnly: boolean = false) {
    //false
    const data: any = {};
    for (const key in this) {
      if (!['UserId', 'enabled', 'createddt'].includes(key) || !dataOnly) {
        // (condition1 || condition2) true
        data[key] = this[key];
      }
    }
    return data;
  }

  static async getFromId(
    postgress: PostgresService,
    userId: string
  ): Promise<any> {
    const cachedCarData = await redisClient.get(`user:${userId}`);
    console.log(cachedCarData);
    if (cachedCarData) {
      console.log('inside  get redis by id');

      return UserModel.build(JSON.parse(cachedCarData));
    }
    try {
      console.log('database to check for id');
      const result = await postgress.client.query(
        'SELECT * FROM users WHERE user_id = $1 and enabled=$2',
        [userId, true]
      );

      if (result.rows.length > 0) {
        const userData = UserModel.build(result.rows[0]);
        console.log('setting user by id in redis');
        await set(`user:${userId}`, JSON.stringify(userData));

        return userData;
      } else {
        console.log('taking null');
        return null;
      }
    } catch (error) {
      const err = 'ERROR GETTING USER BY ID';
      console.error('Error getting user by id:', error);
      throw err;
    }
  }
  static build(rawData: any): UserModel {
    try {
      const currentYear = new Date().getFullYear().toString();
      console.log(currentYear);

      console.log('inside build');
      console.log(rawData);
      if (rawData.data !== undefined) {
        Object.assign(rawData, rawData.data);
      }
      console.log('afterobjectassign');
      console.log(rawData);
      const user = new UserModel();
      (user.UserId = rawData.user_id || rawData.UserId || uuidv4()),
        (user.name = rawData.name),
        (user.username = rawData.username),
        (user.password = rawData.password),
        (user.age = rawData.age),
        (user.gender = rawData.gender),
        (user.role = rawData.role),
        (user.enabled = rawData.enabled !== undefined ? rawData.enabled : true);
      user.createdDt = rawData.createdDt
        ? new Date(rawData.createdDt)
        : new Date();
      console.log('build succesful');
      console.log(user);
      const birthyear = parseInt(currentYear) - user.age;
      const forbiddenTerms = [
        user.username,
        user.name,
        currentYear,
        birthyear.toString(),
      ];
      if (forbiddenTerms.some((term) => user.password.includes(term))) {
        const err =
          'Password should not contain username, name, current year, or birth year.';
        throw new BadRequestException(err);
      }
      if (user.password) {
        const valid = new jf.Validator({
          abortEarly: false,
          allowUnknown: true,
        }).validate(user);

        console.log(valid);
        if (valid.error) {
          const err = 'validation failure';
          throw new BadRequestException(err);
        }
        return user;
      }
    } catch (err) {
      throw err;
    }
  }

  static validate(user: any): { error?: any } {
    console.log('in validate');
    console.log(user);
    const { error } = jf.validate(user);
    if (error) {
      console.error('Validation failed:', error);
    }
    throw error;
  }
  getSanitizedData(): Partial<UserModel> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedData } = this;
    return sanitizedData;
  }
  async save(postgress: PostgresService): Promise<any> {
    console.log(this);
    const existinguser = await UserModel.getFromUsername(
      postgress,
      this.username
    );
    console.log('inside save');
    console.log(existinguser);
    console.log(this);
    const data = this.toJSON(true);
    if (existinguser) {
      const result = await postgress.client.query(
        'UPDATE users SET enabled = $1, createddt=$2, data = $3 WHERE user_id = $4',
        [this.enabled, this.createdDt, data, this.UserId]
      );
      console.log('checking result');
      console.log(result);
      console.log('checking cardata');
      console.log(this);
      await set(`user:${this.UserId}`, JSON.stringify(this));
      return result;
    } else {
      console.log(this);
      const result2 = await postgress.client.query(
        'INSERT INTO users (data, enabled, user_id,createddt) VALUES ($1, $2, $3,$4) RETURNING *',
        [data, this.enabled, this.UserId, this.createdDt]
      );
      console.log('checking userdata');
      console.log(result2);
      await set(`user:${this.UserId}`, JSON.stringify(this));
      await set(`user:${this.username.toLowerCase()}`, JSON.stringify(this));

      console.log(JSON.stringify(this));
      return this;
    }
  }

  giveSanitizedData(): Partial<UserModel> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedData } = this;
    return sanitizedData;
  }

  static async getFromUsername(
    postgress: PostgresService,
    username: string
  ): Promise<UserModel | null> {
    try {
      const cachedUser = await redisClient.get(
        `user:${username.toLowerCase()}`
      );
      console.log('cache in getfromuser');
      console.log(cachedUser);
      const val1 = JSON.parse(cachedUser);
      if (cachedUser) {
        console.log('going inside cached');
        console.log(cachedUser);
        return UserModel.build(val1);
      }

      const result = await postgress.client.query(
        "SELECT * FROM users WHERE data->>'username' = $1 AND enabled=true",
        [username]
      );
      if (result.rows.length) {
        const userData = result.rows[0];
        const user = UserModel.build(userData);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      const err = 'Failed to fetch user by username';
      throw new Error(err);
    }
  }
}
