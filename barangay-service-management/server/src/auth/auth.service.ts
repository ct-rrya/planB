import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../database/schemas/user.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user._id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async findUserById(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async createInitialAdmin(): Promise<void> {
    const adminExists = await this.userModel.findOne({ role: 'super_admin' }).exec();
    if (!adminExists) {
      const hashedPassword = await this.hashPassword('admin123');
      const admin = new this.userModel({
        username: 'admin',
        password: hashedPassword,
        role: 'super_admin',
      });
      await admin.save();
      console.log('✅ Initial admin account created: username=admin, password=admin123');
    }
  }
}
