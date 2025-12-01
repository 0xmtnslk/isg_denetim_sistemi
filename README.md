# İSG Saha Denetimi Web Uygulaması

İş Sağlığı ve Güvenliği (İSG) saha denetimleri için geliştirilmiş modern web uygulaması.

## ⚠️ ÖNEMLİ NOTLAR

- Bu dokümantasyonda `/home/ubuntu/isg_denetim_sistemi/` dizini kullanılmıştır
- **Eğer root kullanıcısı olarak kurulum yapıyorsanız** `/root/isg_denetim_sistemi/` kullanın
- **Path'leri kendi kurulum dizininize göre değiştirmeyi unutmayın!**
- Bu dokümantasyon, gerçek kurulum sırasında karşılaşılan sorunlar ve çözümleriyle güncellenmiştir

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji Stack](#teknoloji-stack)
- [Sistem Gereksinimleri](#sistem-gereksinimleri)
- [Kurulum](#kurulum)
  - [1. Gerekli Paketlerin Kurulumu](#1-gerekli-paketlerin-kurulumu)
  - [2. Projeyi Klonlama/İndirme](#2-projeyi-klonlamaindirme)
  - [3. Docker ile PostgreSQL ve pgAdmin Kurulumu](#3-docker-ile-postgresql-ve-pgadmin-kurulumu)
  - [4. Backend Kurulumu](#4-backend-kurulumu)
  - [5. Frontend Kurulumu](#5-frontend-kurulumu)
  - [6. Systemd Servisleri](#6-systemd-servisleri)
- [Kullanım](#kullanım)
- [Sorun Giderme](#sorun-giderme)
- [Güvenlik](#güvenlik)
- [Yedekleme](#yedekleme)

---

## 🎯 Özellikler

### Kullanıcı Yönetimi
- **3 Rol**: Admin, İSG Uzmanı, Denetçi
- JWT tabanlı kimlik doğrulama
- Şifre yönetimi ve değiştirme

### Grup ve Tesis Yönetimi
- Hiyerarşik yapı (Grup → Tesisler)
- CRUD işlemleri (sadece Admin)

### Soru Havuzu
- **Bölüm** → **Kategori** → **Soru** yapısı
- TW Skoru (1-10 arası önem derecesi)
- Kapsamlı CRUD işlemleri

### Denetim Şablonları
- Soru havuzundan özelleştirilebilir şablonlar
- Şablon aktif/pasif yönetimi

### Denetim Gerçekleştirme
- 4 cevap seçeneği (Karşılıyor, Kısmen Karşılıyor, Karşılamıyor, Kapsam Dışı)
- Koşullu fotoğraf ve açıklama zorunluluğu
- Çoklu fotoğraf yükleme
- Taslak kaydetme özelliği

### TW Skoru Hesaplama
- Bölüm bazında skor hesaplama
- Genel denetim skoru
- Otomatik hesaplama algoritması

### PDF Rapor
- Detaylı denetim raporu
- Grafik ve istatistikler
- Fotoğraf ve açıklamalar

### Analiz ve Grafikler
- Bölüm bazında skor karşılaştırması
- Cevap dağılımı
- Zaman içinde trend analizi

---

## 🛠 Teknoloji Stack

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT (Passport)
- **PDF**: Puppeteer

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: Chart.js
- **Icons**: Lucide React

### DevOps
- **Database**: Docker (PostgreSQL + pgAdmin)
- **Process Manager**: systemd
- **Server**: Ubuntu 22.04

---

## 💻 Sistem Gereksinimleri

- **İşletim Sistemi**: Ubuntu 22.04 LTS
- **RAM**: Minimum 2GB, Önerilen 4GB+
- **Disk**: Minimum 10GB boş alan
- **CPU**: 2+ core
- **Network**: İnternet bağlantısı (kurulum için)

---

## 📦 Kurulum

### 1. Gerekli Paketlerin Kurulumu

#### 1.1. Sistem Güncellemeleri

```bash
# Root kullanıcısı olarak giriş yapın
sudo su -

# Sistem paketlerini güncelleyin
apt update && apt upgrade -y
```

#### 1.2. Node.js 18.x Kurulumu

```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Node.js kur
apt install -y nodejs

# Kurulumu doğrula
node --version  # v18.x.x görmelisiniz
npm --version   # 9.x.x veya üzeri görmelisiniz
```

#### 1.3. Docker ve Docker Compose Kurulumu

```bash
# Eski Docker sürümlerini kaldır
apt remove -y docker docker-engine docker.io containerd runc

# Gerekli paketleri kur
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Docker GPG key ekle
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker repository ekle
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker'ı kur
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Kurulumu doğrula
docker --version
docker compose version

# Docker servisini başlat ve otomatik başlatmayı aktif et
systemctl start docker
systemctl enable docker
```

#### 1.4. Git Kurulumu

```bash
apt install -y git

# Kurulumu doğrula
git --version
```

#### 1.5. Build Araçları

```bash
# C/C++ derleyicileri ve build araçları (Puppeteer için gerekli)
apt install -y build-essential

# Puppeteer için Chrome dependencies
apt install -y chromium-browser
```

---

### 2. Projeyi Klonlama/İndirme

```bash
# Proje dizinine git
cd /home/ubuntu

# GitHub'dan klonla (veya projeyi buraya kopyalayın)
# git clone https://github.com/KULLANICI_ADINIZ/isg_denetim_sistemi.git

# Proje dizinine git
cd isg_denetim_sistemi

# Dizin yapısını kontrol et
ls -la
# Görmelisiniz: backend/ frontend/ docker/ systemd/ README.md
```

---

### 3. Docker ile PostgreSQL ve pgAdmin Kurulumu

#### 3.1. Docker Container'ları Başlat

```bash
# Docker klasörüne git
cd /home/ubuntu/isg_denetim_sistemi/docker

# Container'ları başlat (arka planda çalışacak)
docker compose up -d

# Container'ların durumunu kontrol et
docker compose ps

# Çıktı şu şekilde olmalı:
# NAME              STATUS   PORTS
# isg_postgres      Up       0.0.0.0:5432->5432/tcp
# isg_pgadmin       Up       0.0.0.0:5050->5050/tcp
```

#### 3.2. PostgreSQL Bağlantısını Test Et

```bash
# PostgreSQL container'ına bağlan
docker exec -it isg_postgres psql -U isg_admin -d isg_denetim

# Bağlantı başarılıysa PostgreSQL prompt göreceksiniz
# isg_denetim=#

# Çıkmak için:
\q
```

#### 3.3. pgAdmin'e Erişim

1. Web tarayıcınızda açın: **http://SUNUCU_IP:5050**
2. Giriş bilgileri:
   - **Email**: admin@isg.com
   - **Şifre**: admin123

3. Yeni sunucu ekle:
   - **Name**: ISG Database
   - **Host**: isg_postgres
   - **Port**: 5432
   - **Database**: isg_denetim
   - **Username**: isg_admin
   - **Password**: isg_secure_password_2024

---

### 4. Backend Kurulumu

#### 4.1. Bağımlılıkları Kur

```bash
# Backend dizinine git
cd /home/ubuntu/isg_denetim_sistemi/backend

# Node.js paketlerini kur (bu işlem birkaç dakika sürebilir)
# ⚠️ ÖNEMLİ: Dependency conflict hatası alırsanız --legacy-peer-deps kullanın
npm install --legacy-peer-deps

# Kurulum tamamlandığında şu mesajı görmelisiniz:
# added XXX packages

# ⚠️ NOT: Eğer "ERESOLVE unable to resolve dependency tree" hatası alırsanız,
# yukarıdaki komutta --legacy-peer-deps flag'i mutlaka kullanılmalıdır
```

#### 4.2. Environment Değişkenlerini Ayarla

```bash
# .env dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

**.env içeriği** (gerekirse şifreleri ve IP adreslerini değiştirin):

```env
# Database
# ⚠️ ÖNEMLİ: Kullanıcı adı, şifre ve veritabanı adı docker-compose.yml ile eşleşmeli
DATABASE_URL="postgresql://isg_admin:isg_secure_password_2024@localhost:5432/isg_denetim?schema=public"

# JWT Secret (ÖNEMLİ: Production'da mutlaka değiştirin!)
JWT_SECRET="isg-secret-key-2024-change-this-in-production"

# Server
PORT=3000
NODE_ENV=production

# Frontend URL (CORS için - ⚠️ MUTLAKA EKLEYIN!)
# Localhost kurulumu için:
FRONTEND_URL="http://localhost:5173"
# Veya sunucu IP'niz varsa (örnek):
# FRONTEND_URL="http://77.42.22.226:5173"
```

**Kaydet ve çık**: `Ctrl+X`, sonra `Y`, sonra `Enter`

#### 4.3. Prisma Migrations ve Database Setup

```bash
# Prisma client oluştur
npx prisma generate

# Database schema'yı veritabanına uygula
# ⚠️ ÖNEMLİ: migrate deploy yerine db push kullanın
# Çünkü migration dosyaları henüz oluşturulmamış olabilir
npx prisma db push

# Başarılı olursa şu mesajı göreceksiniz:
# 🚀 Your database is now in sync with your Prisma schema.

# Seed data ekle (ilk admin kullanıcısı oluşturur)
# ⚠️ ÖNEMLİ: "npm run seed" değil, "npm run prisma:seed" kullanın
npm run prisma:seed

# Başarılı olursa şu çıktıyı göreceksiniz:
# ✅ Admin kullanıcısı oluşturuldu:
#    Kullanıcı Adı: admin
#    Şifre: Admin123!

# ⚠️ SORUN GİDERME:
# Eğer "npm run prisma:seed" çalışmazsa, package.json'da seed script'ini kontrol edin
# Alternatif olarak direkt çalıştırabilirsiniz:
# npx ts-node prisma/seed.ts
```

#### 4.4. Backend'i Derleme

```bash
# TypeScript kodunu JavaScript'e derle
npm run build

# Derleme başarılıysa dist/ klasörü oluşacak
ls -la dist/

# ⚠️ ÖNEMLİ: Build path'i kontrol edin
# Doğru path: dist/src/main.js (dist/main.js DEĞİL!)
ls -la dist/src/main.js
```

#### 4.5. Backend'i Test Et (Manuel)

```bash
# Backend'i test modunda çalıştır
npm run start:prod

# Başarılıysa şu mesajları göreceksiniz:
# 🟢 Veritabanı bağlantısı kuruldu
# 🚀 İSG Denetim Sistemi Backend başlatıldı: http://localhost:3000

# ⚠️ ÖNEMLİ NOT: main.ts dosyasında backend'in 0.0.0.0 adresine bind olduğundan emin olun
# await app.listen(port, '0.0.0.0'); şeklinde olmalı
# Aksi takdirde sadece localhost'tan erişilebilir, dışarıdan erişilemez

# Başka bir terminalde test et:
curl http://localhost:3000/api

# Ctrl+C ile durdurun
```

---

### 5. Frontend Kurulumu

#### 5.1. Bağımlılıkları Kur

```bash
# Frontend dizinine git
cd /home/ubuntu/isg_denetim_sistemi/frontend

# Node.js paketlerini kur
# ⚠️ ÖNEMLİ: Backend gibi, burada da --legacy-peer-deps kullanın
npm install --legacy-peer-deps

# ⚠️ NOT: Eğer dependency conflict hatası alırsanız,
# yukarıdaki komutta --legacy-peer-deps flag'i mutlaka kullanılmalıdır
```

#### 5.2. Environment Değişkenlerini Ayarla

```bash
# .env dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

**.env içeriği** (sunucu IP'nizi veya localhost kullanın):

```env
# API URL - ⚠️ MUTLAKA SONUNDA /api OLMALI!
# Localhost kurulumu için:
VITE_API_URL=http://localhost:3000/api

# Veya sunucu IP'niz varsa (örnek):
# VITE_API_URL=http://77.42.22.226:3000/api

# ⚠️ ÖNEMLİ HATIRLATMA:
# - URL'nin sonunda /api olmalı (http://localhost:3000/api ✅)
# - /api olmadan çalışmaz (http://localhost:3000 ❌)
# - Backend'deki FRONTEND_URL ile eşleşmeli (CORS için)
```

**Kaydet ve çık**: `Ctrl+X`, sonra `Y`, sonra `Enter`

#### 5.3. Frontend'i Derleme

```bash
# Production build
npm run build

# Build başarılıysa dist/ klasörü oluşacak
ls -la dist/

# index.html ve assets/ klasörünü göreceksiniz
```

#### 5.4. Serve Paketini Global Kur

```bash
# Frontend'i serve etmek için
npm install -g serve

# Kurulumu doğrula
serve --version
```

---

### 6. Systemd Servisleri

#### 6.1. Service Dosyalarını Kopyala ve Düzenle

```bash
# Backend service dosyasını kopyala
cp /home/ubuntu/isg_denetim_sistemi/systemd/isg-backend.service /etc/systemd/system/

# Frontend service dosyasını kopyala
cp /home/ubuntu/isg_denetim_sistemi/systemd/isg-frontend.service /etc/systemd/system/

# ⚠️ ÖNEMLİ: Service dosyalarındaki path'leri kontrol edin ve düzenleyin
# Eğer root kullanıcısı olarak /root dizininde kurulum yaptıysanız:
nano /etc/systemd/system/isg-backend.service
# WorkingDirectory ve ExecStart satırlarındaki path'leri değiştirin:
# /home/ubuntu/isg_denetim_sistemi/backend yerine
# /root/isg_denetim_sistemi/backend yazın

nano /etc/systemd/system/isg-frontend.service
# WorkingDirectory ve ExecStart satırlarındaki path'leri değiştirin:
# /home/ubuntu/isg_denetim_sistemi/frontend yerine
# /root/isg_denetim_sistemi/frontend yazın

# ⚠️ NOT: dist/main.js yerine dist/src/main.js olduğundan emin olun (backend service'de)

# Dosyaların kopyalandığını kontrol et
ls -la /etc/systemd/system/isg-*
```

#### 6.2. Systemd'yi Yenile ve Servisleri Başlat

```bash
# Systemd daemon'ı yenile
systemctl daemon-reload

# Backend servisini aktif et ve başlat
systemctl enable isg-backend
systemctl start isg-backend

# Frontend servisini aktif et ve başlat
systemctl enable isg-frontend
systemctl start isg-frontend

# Servis durumlarını kontrol et
systemctl status isg-backend
systemctl status isg-frontend

# Her iki servis de "active (running)" durumunda olmalı
```

#### 6.3. Log Dosyalarını Kontrol Et

```bash
# Backend logları
tail -f /var/log/isg-backend.log

# Backend hata logları
tail -f /var/log/isg-backend-error.log

# Frontend logları
tail -f /var/log/isg-frontend.log

# Ctrl+C ile çıkış
```

---

## 🎉 Kullanım

### İlk Giriş

1. **Web tarayıcınızı açın** ve şu adrese gidin:
   ```
   http://SUNUCU_IP:5173
   ```

2. **Giriş bilgileri**:
   - **Kullanıcı Adı**: `admin`
   - **Şifre**: `Admin123!`

3. İlk girişten sonra **mutlaka şifrenizi değiştirin**!

### Temel Kullanım Akışı

#### 1. Kullanıcı Oluşturma (Admin)
- Sol menüden **"Kullanıcılar"** seçin
- **"Yeni Kullanıcı"** butonuna tıklayın
- Formu doldurun ve kaydedin

#### 2. Grup ve Tesis Ekleme (Admin)
- **"Gruplar"** menüsünden yeni grup oluşturun
- Grup altına tesisler ekleyin

#### 3. Soru Havuzu Oluşturma (Admin)
- **"Soru Havuzu"** menüsüne gidin
- Önce **Bölüm** oluşturun (örn: "Yangın Güvenliği")
- Bölüm altında **Kategori** oluşturun
- Kategoriler altına **sorular** ekleyin (TW skorlarını belirtin)

#### 4. Şablon Oluşturma (Admin)
- **"Şablonlar"** menüsüne gidin
- Yeni şablon oluşturun
- Soru havuzundan soruları seçerek şablona ekleyin

#### 5. Denetim Yapma (Tüm Kullanıcılar)
- **"Denetimler"** → **"Yeni Denetim"**
- Tesis ve şablon seçin
- Her soru için cevap verin
- Gerekirse fotoğraf yükleyin ve açıklama yazın
- Tamamlandığında **"Denetimi Tamamla"** butonuna tıklayın

#### 6. Rapor İndirme
- Tamamlanmış denetimi açın
- **"PDF İndir"** butonuna tıklayın

#### 7. İstatistikleri Görüntüleme
- **"İstatistikler"** menüsüne gidin
- Filtreler kullanarak analiz yapın

---

## 🔧 Sorun Giderme

Bu bölüm, gerçek kurulum sırasında karşılaşılan ve çözülen sorunları içerir.

### 1. NPM Install Dependency Conflict Hatası

**Sorun**: `npm install` komutu "ERESOLVE unable to resolve dependency tree" hatası veriyor.

**Çözüm**:
```bash
# Backend için
cd /home/ubuntu/isg_denetim_sistemi/backend
npm install --legacy-peer-deps

# Frontend için
cd /home/ubuntu/isg_denetim_sistemi/frontend
npm install --legacy-peer-deps
```

### 2. Prisma Migration Hatası

**Sorun**: `npx prisma migrate deploy` çalışmıyor, migration dosyaları bulunamıyor.

**Çözüm**: `migrate deploy` yerine `db push` kullanın:
```bash
cd /home/ubuntu/isg_denetim_sistemi/backend
npx prisma db push
npm run prisma:seed
```

### 3. Seed Script Bulunamıyor

**Sorun**: `npm run seed` komutu çalışmıyor.

**Çözüm**: Doğru komut `npm run prisma:seed`:
```bash
npm run prisma:seed

# Eğer hala çalışmazsa:
npx ts-node prisma/seed.ts
```

### 4. Backend Build Path Hatası

**Sorun**: Systemd servisi backend'i başlatamıyor, `dist/main.js` bulunamıyor.

**Çözüm**: Doğru path `dist/src/main.js`:
```bash
# Build sonrası kontrol edin:
ls -la /home/ubuntu/isg_denetim_sistemi/backend/dist/src/main.js

# Service dosyasını düzenleyin:
nano /etc/systemd/system/isg-backend.service
# ExecStart satırını şu şekilde değiştirin:
# ExecStart=/usr/bin/node dist/src/main.js
```

### 5. Backend Dışarıdan Erişilemiyor

**Sorun**: Backend localhost:3000'de çalışıyor ama dışarıdan erişilemiyor.

**Çözüm**: `main.ts` dosyasında backend'in `0.0.0.0` adresine bind olduğundan emin olun:
```typescript
// backend/src/main.ts dosyasını düzenleyin
await app.listen(port, '0.0.0.0'); // localhost yerine 0.0.0.0
```

Sonra rebuild ve restart:
```bash
cd /home/ubuntu/isg_denetim_sistemi/backend
npm run build
systemctl restart isg-backend
```

### 6. CORS Hatası - Frontend Backend'e Bağlanamıyor

**Sorun**: Browser console'da CORS hatası: "Access to XMLHttpRequest blocked by CORS policy"

**Çözüm**: Backend `.env` dosyasına `FRONTEND_URL` ekleyin:
```bash
nano /home/ubuntu/isg_denetim_sistemi/backend/.env

# Şunu ekleyin (IP'nizi yazın):
FRONTEND_URL="http://77.42.22.226:5173"

# Servisi yeniden başlatın:
systemctl restart isg-backend
```

### 7. Frontend API URL Hatası

**Sorun**: Frontend backend'e istek atıyor ama 404 hatası alıyor.

**Çözüm**: `VITE_API_URL` sonunda `/api` ile bitmeli:
```bash
nano /home/ubuntu/isg_denetim_sistemi/frontend/.env

# Doğru format:
VITE_API_URL=http://77.42.22.226:3000/api

# Yanlış format:
# VITE_API_URL=http://77.42.22.226:3000

# Rebuild ve restart:
cd /home/ubuntu/isg_denetim_sistemi/frontend
npm run build
systemctl restart isg-frontend
```

### 8. Systemd Service Path Hatası

**Sorun**: Service dosyalarındaki path'ler yanlış (root dizininde kurulum yaptıysanız).

**Çözüm**: Service dosyalarını düzenleyin:
```bash
# Backend service
nano /etc/systemd/system/isg-backend.service
# WorkingDirectory=/root/isg_denetim_sistemi/backend
# ExecStart=/usr/bin/node /root/isg_denetim_sistemi/backend/dist/src/main.js

# Frontend service
nano /etc/systemd/system/isg-frontend.service
# WorkingDirectory=/root/isg_denetim_sistemi/frontend
# ExecStart=/usr/bin/npx serve -s /root/isg_denetim_sistemi/frontend/dist -l 5173

# Daemon reload ve restart
systemctl daemon-reload
systemctl restart isg-backend isg-frontend
```

### 9. pgAdmin Bağlantı Hatası

**Sorun**: pgAdmin'de database'e bağlanılamıyor.

**Çözüm**: Doğru bağlantı bilgilerini kullanın:
- **Host**: `isg_postgres` (localhost değil!)
- **Port**: `5432`
- **Database**: `isg_denetim`
- **Username**: `isg_admin`
- **Password**: `isg_secure_password_2024`

### 10. Firewall Portları Kapalı

**Sorun**: Sunucu IP'den uygulama açılmıyor.

**Çözüm**: Gerekli portları açın:
```bash
# Firewall durumunu kontrol edin
ufw status

# Portları açın
ufw allow 3000/tcp   # Backend
ufw allow 5173/tcp   # Frontend
ufw allow 5432/tcp   # PostgreSQL (opsiyonel)
ufw allow 5050/tcp   # pgAdmin (opsiyonel)

# Firewall'ı yeniden başlatın
ufw reload
```

### 11. Genel Backend Sorunları

```bash
# Servis durumunu kontrol et
systemctl status isg-backend

# Hata loglarını incele
tail -100 /var/log/isg-backend-error.log

# Servisi yeniden başlat
systemctl restart isg-backend

# Database bağlantısını test et
docker exec -it isg_postgres psql -U isg_admin -d isg_denetim

# Manuel olarak çalıştırıp hataları gör
cd /home/ubuntu/isg_denetim_sistemi/backend
npm run start:prod
```

### 12. Genel Frontend Sorunları

```bash
# Servis durumunu kontrol et
systemctl status isg-frontend

# Logları incele
tail -100 /var/log/isg-frontend.log

# Servisi yeniden başlat
systemctl restart isg-frontend

# Manuel olarak serve et (test için)
cd /home/ubuntu/isg_denetim_sistemi/frontend
npx serve -s dist -l 5173
```

### 13. Docker Container Sorunları

```bash
# Container durumunu kontrol et
docker compose -f /home/ubuntu/isg_denetim_sistemi/docker/docker-compose.yml ps

# Container loglarını incele
docker logs isg_postgres
docker logs isg_pgadmin

# Container'ları yeniden başlat
cd /home/ubuntu/isg_denetim_sistemi/docker
docker compose restart

# Veya tamamen yeniden oluştur
docker compose down
docker compose up -d
```

### 14. Port Çakışmaları

```bash
# Hangi processin hangi portu kullandığını kontrol et
netstat -tulpn | grep :3000
netstat -tulpn | grep :5173
netstat -tulpn | grep :5432

# Eğer port meşgulse, processi durdur
kill -9 <PID>

# Veya farklı port kullan (.env dosyalarını düzenleyin)
```

### 15. Database Tamamen Sıfırlama (Son Çare!)

```bash
cd /home/ubuntu/isg_denetim_sistemi/backend

# ⚠️ DİKKAT: Tüm veri silinir!
npx prisma db push --force-reset

# Seed data ekle
npm run prisma:seed

# Backend'i yeniden başlat
systemctl restart isg-backend
```

---

## 🔒 Güvenlik

### Önemli Güvenlik Adımları

#### 1. JWT Secret Değiştirme

```bash
# Backend .env dosyasını düzenle
nano /home/ubuntu/isg_denetim_sistemi/backend/.env

# JWT_SECRET'i güçlü bir değer ile değiştir
JWT_SECRET="super-gizli-random-string-buraya-64-karakter-uzunlugunda"

# Servisi yeniden başlat
systemctl restart isg-backend
```

#### 2. Database Şifrelerini Değiştirme

```bash
# Docker compose dosyasını düzenle
nano /home/ubuntu/isg_denetim_sistemi/docker/docker-compose.yml

# POSTGRES_PASSWORD değerini değiştir
# .env dosyasındaki DATABASE_URL'i de güncelle

# Container'ları yeniden oluştur
cd /home/ubuntu/isg_denetim_sistemi/docker
docker compose down
docker compose up -d
```

#### 3. Firewall Ayarları (ufw)

```bash
# SSH portunu ÖNCE açın (DİKKAT: Bunu yapmazsanız sunucuya erişemezsiniz!)
ufw allow 22/tcp

# ufw'yi aktif et
ufw enable

# ⚠️ ÖNEMLİ: Uygulama portlarını mutlaka açın!
ufw allow 3000/tcp  # Backend API (Zorunlu)
ufw allow 5173/tcp  # Frontend Web UI (Zorunlu)
ufw allow 5432/tcp  # PostgreSQL (Opsiyonel - dışarıdan erişim gerekiyorsa)
ufw allow 5050/tcp  # pgAdmin (Opsiyonel - web arayüzüne erişim gerekiyorsa)

# Durumu kontrol et
ufw status verbose

# Port 3000 ve 5173'ün açık olduğunu görmelisiniz:
# 3000/tcp                   ALLOW       Anywhere
# 5173/tcp                   ALLOW       Anywhere

# Test edin
curl http://localhost:3000/api
# Dışarıdan test: http://SUNUCU_IP:3000/api
```

#### 4. Admin Şifresini Değiştirme

- Web arayüzünden giriş yapın
- Sağ üst köşeden **"Profil"** → **"Şifre Değiştir"**
- Yeni güçlü bir şifre belirleyin

---

## 💾 Yedekleme ve Geri Yükleme

### Database Yedekleme

```bash
# Otomatik yedekleme scripti oluştur
cat > /root/backup-isg-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/isg-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec isg_postgres pg_dump -U isg_admin isg_denetim > $BACKUP_DIR/isg_backup_$DATE.sql

# 30 günden eski yedekleri sil
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Yedekleme tamamlandı: isg_backup_$DATE.sql"
EOF

# Script'i çalıştırılabilir yap
chmod +x /root/backup-isg-db.sh

# Cron job ekle (her gün saat 02:00'de çalışsın)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-isg-db.sh") | crontab -

# Manuel yedekleme
/root/backup-isg-db.sh
```

### Database Geri Yükleme

```bash
# Yedek dosyasını container'a kopyala
docker cp /root/isg-backups/isg_backup_TARIH.sql isg_postgres:/tmp/

# Database'i geri yükle
docker exec isg_postgres psql -U isg_admin -d isg_denetim -f /tmp/isg_backup_TARIH.sql

# Servisleri yeniden başlat
systemctl restart isg-backend
systemctl restart isg-frontend
```

---

## 📞 Destek ve Katkıda Bulunma

- **Sorun Bildirimi**: GitHub Issues
- **Geliştirici**: [İletişim Bilgisi]
- **Lisans**: MIT

---

## 🎓 Notlar

- İlk kurulum yaklaşık **30-45 dakika** sürer
- Tüm komutları **root kullanıcısı** olarak çalıştırın
- Üretim ortamında **mutlaka güvenlik ayarlarını** yapın
- Düzenli **yedekleme** almayı unutmayın
- Log dosyalarını periyodik olarak **temizleyin**

---

## ✅ Kurulum Kontrol Listesi

### Sistem Gereksinimleri
- [ ] Ubuntu 22.04 LTS kurulu
- [ ] Node.js 18+ kurulu ve çalışıyor
- [ ] Docker ve Docker Compose kurulu
- [ ] Git kurulu

### Veritabanı
- [ ] PostgreSQL ve pgAdmin container'ları çalışıyor
- [ ] pgAdmin'den database'e bağlanabiliyorum
- [ ] Veritabanı bilgileri doğru (isg_denetim, isg_admin, isg_secure_password_2024)

### Backend
- [ ] `npm install --legacy-peer-deps` başarılı
- [ ] `.env` dosyası oluşturuldu ve düzenlendi
- [ ] `DATABASE_URL` doğru
- [ ] `FRONTEND_URL` eklendi
- [ ] `npx prisma db push` başarılı
- [ ] `npm run prisma:seed` başarılı (admin kullanıcısı oluştu)
- [ ] `npm run build` başarılı
- [ ] `dist/src/main.js` dosyası var
- [ ] `main.ts`'de `0.0.0.0` binding yapılmış
- [ ] Backend servisi aktif ve çalışıyor
- [ ] `curl http://localhost:3000/api` çalışıyor

### Frontend
- [ ] `npm install --legacy-peer-deps` başarılı
- [ ] `.env` dosyası oluşturuldu
- [ ] `VITE_API_URL` sonunda `/api` ile bitiyor
- [ ] `npm run build` başarılı
- [ ] `dist/` klasörü oluştu
- [ ] Frontend servisi aktif ve çalışıyor
- [ ] Web arayüzü açılıyor (http://SUNUCU_IP:5173)

### Systemd Servisleri
- [ ] Backend service dosyası path'leri doğru
- [ ] Frontend service dosyası path'leri doğru
- [ ] Her iki servis de `active (running)` durumunda
- [ ] Log dosyaları oluşuyor ve hata yok

### Güvenlik ve Erişim
- [ ] Firewall portları açık (3000, 5173)
- [ ] İlk admin girişi başarılı (admin / Admin123!)
- [ ] Admin şifresi değiştirildi
- [ ] JWT secret değiştirildi (production için)
- [ ] CORS hatası yok

### Test ve Yedekleme
- [ ] Frontend'den backend'e istek atılabiliyor
- [ ] Login çalışıyor
- [ ] Kullanıcı oluşturulabiliyor
- [ ] Otomatik yedekleme scripti kuruldu

---

## 🚀 Hızlı Başlangıç Özet

Kurulum tamamlandıysa, bu özet adımları takip ederek sistemi hızlıca başlatabilirsiniz:

### Servisleri Başlatma
```bash
# Docker container'ları başlat
cd /home/ubuntu/isg_denetim_sistemi/docker
docker compose up -d

# Backend ve Frontend servislerini başlat
systemctl start isg-backend
systemctl start isg-frontend

# Durumu kontrol et
systemctl status isg-backend isg-frontend
```

### Servisleri Durdurma
```bash
# Backend ve Frontend servislerini durdur
systemctl stop isg-backend isg-frontend

# Docker container'ları durdur
cd /home/ubuntu/isg_denetim_sistemi/docker
docker compose down
```

### Logları İzleme
```bash
# Backend logları
tail -f /var/log/isg-backend.log

# Frontend logları
tail -f /var/log/isg-frontend.log

# Hata logları
tail -f /var/log/isg-backend-error.log
```

### Hızlı Test
```bash
# Backend test
curl http://localhost:3000/api

# Frontend test (tarayıcıda)
# http://SUNUCU_IP:5173

# Database test
docker exec -it isg_postgres psql -U isg_admin -d isg_denetim
```

---

## 📝 Önemli Notlar ve İpuçları

### Kurulum Sırasında Dikkat Edilecekler
1. **Path'ler**: Tüm path'lerin (`/home/ubuntu/` veya `/root/`) tutarlı olduğundan emin olun
2. **Dependency conflicts**: Mutlaka `--legacy-peer-deps` kullanın
3. **Prisma**: `migrate deploy` yerine `db push` kullanın
4. **CORS**: Backend `.env`'de `FRONTEND_URL` mutlaka olmalı
5. **API URL**: Frontend'te `/api` ile bitmeli
6. **Firewall**: Port 3000 ve 5173 mutlaka açık olmalı
7. **0.0.0.0 binding**: Backend dışarıdan erişilebilir olmalı

### Production Ortamı İçin Ek Öneriler
1. **SSL/TLS**: Nginx ile reverse proxy ve Let's Encrypt SSL sertifikası kullanın
2. **Domain**: IP yerine domain kullanın
3. **Environment variables**: Tüm şifreleri ve secret'ları değiştirin
4. **Backup**: Düzenli veritabanı yedeklemesi alın
5. **Monitoring**: Log monitoring ve alert sistemi kurun
6. **Updates**: Düzenli güvenlik güncellemeleri yapın

### Performans İyileştirmeleri
1. **PM2**: systemd yerine PM2 process manager kullanabilirsiniz
2. **Nginx**: Static dosyalar için Nginx kullanın
3. **Database**: PostgreSQL performans ayarlarını yapın
4. **Caching**: Redis cache ekleyebilirsiniz

---

**Başarılar! 🎉**

İSG Denetim Sistemi başarıyla kuruldu ve kullanıma hazır!

Herhangi bir sorun yaşarsanız, **Sorun Giderme** bölümüne bakın.
