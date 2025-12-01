import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed işlemi başlıyor...');

  // İlk admin kullanıcısını kontrol et
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (existingAdmin) {
    console.log('✅ Admin kullanıcısı zaten mevcut.');
    return;
  }

  // Admin kullanıcısı oluştur
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'Sistem Yöneticisi',
      email: 'admin@isg.com',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin kullanıcısı oluşturuldu:');
  console.log('   Kullanıcı Adı: admin');
  console.log('   Şifre: Admin123!');
  console.log('   Email:', admin.email);

  // Örnek grup ve tesis oluştur (opsiyonel)
  const group = await prisma.group.create({
    data: {
      name: 'Örnek Grup',
      description: 'Test için oluşturulmuş örnek grup',
    },
  });

  await prisma.facility.create({
    data: {
      name: 'Örnek Tesis',
      address: 'Örnek Adres',
      city: 'İstanbul',
      groupId: group.id,
    },
  });

  console.log('✅ Örnek grup ve tesis oluşturuldu.');

  // Örnek bölüm, kategori ve sorular
  const section = await prisma.section.create({
    data: {
      name: 'Yangın Güvenliği',
      description: 'Yangın önleme ve söndürme sistemleri',
      order: 1,
    },
  });

  const category = await prisma.category.create({
    data: {
      name: 'Yangın Söndürme Ekipmanları',
      description: 'Yangın söndürücüler ve donanımlar',
      sectionId: section.id,
      order: 1,
    },
  });

  await prisma.question.createMany({
    data: [
      {
        text: 'Yangın söndürücüler yerinde ve kullanılabilir durumda mı?',
        twScore: 8,
        categoryId: category.id,
        order: 1,
      },
      {
        text: 'Yangın söndürücülerin dolum tarihleri güncel mi?',
        twScore: 7,
        categoryId: category.id,
        order: 2,
      },
      {
        text: 'Yangın alarm sistemi çalışır durumda mı?',
        twScore: 9,
        categoryId: category.id,
        order: 3,
      },
    ],
  });

  console.log('✅ Örnek sorular oluşturuldu.');

  console.log('🎉 Seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi sırasında hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
