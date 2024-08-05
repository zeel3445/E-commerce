import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/user.dto';
import { UserModel } from 'src/models/user.model';
import { PostgresService } from 'src/services/pg.services';
import { del } from 'src/services/redis.service';

@Injectable()
export class UserService {
  constructor(private readonly postgress: PostgresService) {}
  async postuser(userdto: CreateUserDto): Promise<any> {
    try {
      const user = new UserModel();
      const existinguser = await UserModel.getFromUsername(
        this.postgress,
        userdto.username
      );
      if (existinguser) {
        const err = 'user already exists';
        throw new ConflictException(err);
      }
      user.name = userdto.name;
      user.username = userdto.username;
      user.password = userdto.password;
      user.age = userdto.age;
      user.gender = userdto.gender;
      user.role = userdto.role;
      if (user.role === 'customer') {
        const val = 'admin cannot make customer';
        return val;
      }

      console.log(user);
      const val = await UserModel.build(user);
      console.log(val);

      await val.save(this.postgress);

      return val.getSanitizedData();
    } catch (err) {
      return err;
    }
  }
  async getuserbyid(id: string): Promise<any> {
    try {
      let user = new UserModel();
      user = await UserModel.getFromId(this.postgress, id);
      console.log(user);
      const val = await UserModel.build(user);
      return val.getSanitizedData();
    } catch (err) {
      return err;
    }
  }
  async deleteuserbyid(
    id: string,
    adminid: string,
    role: string
  ): Promise<any> {
    if (id === adminid) {
      return 'admin is trying to delete itself cannot delete it';
    }
    try {
      let user = new UserModel();
      user = await UserModel.getFromId(this.postgress, id);
      console.log(user);
      if (user) {
        console.log('making enabled false');
        const val = await UserModel.build(user);
        if (val.role === 'customer' && role === 'admin') {
          const val1 = 'admin cannot delete user';
          return val1;
        }

        val.enabled = false;
        await val.save(this.postgress);
        await del(`user:${user.UserId}`);
        console.log(user);
        console.log('delete');
        return 'successfully deleted';
      } else {
        console.error('Error getting user by id:');
        return 'error getting car';
      }
    } catch (err) {
      console.error('Error getting user by id:', err);
      return err;
    }
  }
  async getAll(page = 1, limit = 10, letters?: string): Promise<any> {
    try {
      let query =
        'SELECT user_id, data, createdDt FROM users WHERE enabled = true';
      console.log(query);
      const params: any[] = [];
      if (letters) {
        console.log(letters);
        query += " AND data->>'username' LIKE $1";
        params.push(`%${letters}%`);
      }
      console.log(params);
      const offset = (page - 1) * limit;
      query += ` ORDER BY user_id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      console.log(query);

      const result = await this.postgress.query(query, params);
      //  console.log(result.rows)
      const users = result.rows.map((row) => {
        const userData = { UserId: row.user_id, ...row.data };
        const user = UserModel.build(userData);
        return user.giveSanitizedData();
      });

      console.log(users);
      return users;
    } catch (error) {
      if (error.message === 'Query error') {
        console.error('Error in querying users:', error);
      } else {
        console.error('Unexpected error:', error);
      }
      const err = 'Failed to fetch users';
      throw new BadRequestException(err);
    }
  }
}
