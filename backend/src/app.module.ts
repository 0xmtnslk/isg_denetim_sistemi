import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { SectionsModule } from './sections/sections.module';
import { CategoriesModule } from './categories/categories.module';
import { QuestionsModule } from './questions/questions.module';
import { TemplatesModule } from './templates/templates.module';
import { AuditsModule } from './audits/audits.module';
import { PhotosModule } from './photos/photos.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Static files (fotoğraflar için)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    
    // Modüller
    AuthModule,
    UsersModule,
    GroupsModule,
    FacilitiesModule,
    SectionsModule,
    CategoriesModule,
    QuestionsModule,
    TemplatesModule,
    AuditsModule,
    PhotosModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
