// users/users.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class UsersService {
  private readonly users = [];
  constructor() {
    this.loadUsersFromFile();
  }

  private loadUsersFromFile(): void {
    const filePath = path.join(__dirname, '../../data/users.json');
    if (fs.existsSync(filePath)) {
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const userArray = JSON.parse(jsonData);
      this.users.push(...userArray); // Load users from the file
    }
  }

  private saveUsersToFile(): void {
    const filePath = path.join(__dirname, '../../data/users.json');
    fs.writeFileSync(filePath, JSON.stringify(this.users, null, 2), 'utf-8');
  }
  async findByEmail(email: string) {
    return this.users.find((user) => user.email === email);
  }

  async create(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
    };
    this.users.push(user);
    this.saveUsersToFile();
    return user;
  }
}
