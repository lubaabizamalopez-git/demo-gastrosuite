import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbUrlStr = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/gastrosuite';
    const adapter = new PrismaMariaDb(dbUrlStr);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
