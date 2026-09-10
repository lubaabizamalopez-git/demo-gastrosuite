import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/gastrosuite');
    const adapter = new PrismaMariaDb({ 
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1)
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
