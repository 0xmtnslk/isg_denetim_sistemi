# İSG Saha Denetimi Web Uygulaması

İş Sağlığı ve Güvenliği (İSG) saha denetimleri için geliştirilmiş modern web uygulaması.

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
# git clone https://github.com/0xmtnslk/isg_denetim_sistemi.git

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
npm install

# Kurulum tamamlandığında şu mesajı görmelisiniz:
# added XXX packages
```

#### 4.2. Environment Değişkenlerini Ayarla

```bash
# .env dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

**.env içeriği** (gerekirse şifreleri değiştirin):

```env
# Database
DATABASE_URL="postgresql://isg_admin:isg_secure_password_2024@localhost:5432/isg_denetim?schema=public"

# JWT Secret (ÖNEMLİ: Production'da mutlaka değiştirin!)
JWT_SECRET="isg-secret-key-2024-change-this-in-production"

# Server
PORT=3000
NODE_ENV=production

# Frontend URL (CORS için)
FRONTEND_URL="http://localhost:5173"
```

**Kaydet ve çık**: `Ctrl+X`, sonra `Y`, sonra `Enter`

#### 4.3. Prisma Migrations ve Database Setup

```bash
# Prisma client oluştur
npx prisma generate

# Database migration'ları çalıştır
npx prisma migrate deploy

# Seed data ekle (ilk admin kullanıcısı oluşturur)
npm run prisma:seed

# Başarılı olursa şu çıktıyı göreceksiniz:
# ✅ Admin kullanıcısı oluşturuldu:
#    Kullanıcı Adı: admin
#    Şifre: Admin123!
```

#### 4.4. Backend'i Derleme

```bash
# TypeScript kodunu JavaScript'e derle
npm run build

# Derleme başarılıysa dist/ klasörü oluşacak
ls -la dist/

# main.js dosyasını göreceksiniz
```

#### 4.5. Backend'i Test Et (Manuel)

```bash
# Backend'i test modunda çalıştır
npm run start:prod

# Başarılıysa şu mesajları göreceksiniz:
# 🟢 Veritabanı bağlantısı kuruldu
# 🚀 İSG Denetim Sistemi Backend başlatıldı: http://localhost:3000

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
npm install
```

#### 5.2. Environment Değişkenlerini Ayarla

```bash
# .env dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

**.env içeriği**:

```env
# API URL (sunucu IP'nizi yazın veya localhost bırakın)
VITE_API_URL=http://localhost:3000/api
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

#### 6.1. Service Dosyalarını Kopyala

```bash
# Backend service
cp /home/ubuntu/isg_denetim_sistemi/systemd/isg-backend.service /etc/systemd/system/

# Frontend service
cp /home/ubuntu/isg_denetim_sistemi/systemd/isg-frontend.service /etc/systemd/system/

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

### Backend Çalışmıyor

```bash
# Servis durumunu kontrol et
systemctl status isg-backend

# Hata loglarını incele
tail -100 /var/log/isg-backend-error.log

# Servisi yeniden başlat
systemctl restart isg-backend

# Database bağlantısını test et
docker exec -it isg_postgres psql -U isg_admin -d isg_denetim
```

### Frontend Çalışmıyor

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

### Docker Container'lar Çalışmıyor

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

### Port Çakışmaları

```bash
# Hangi processin hangi portu kullandığını kontrol et
netstat -tulpn | grep :3000
netstat -tulpn | grep :5173
netstat -tulpn | grep :5432

# Eğer port meşgulse, processi durdur veya farklı port kullan
```

### Database Migration Sorunları

```bash
cd /home/ubuntu/isg_denetim_sistemi/backend

# Migration'ları sıfırla (DİKKAT: Tüm veri silinir!)
npx prisma migrate reset

# Yeniden migration çalıştır
npx prisma migrate deploy

# Seed data ekle
npm run prisma:seed
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
# ufw'yi aktif et
ufw enable

# SSH portunu aç (DİKKAT: Bunu yapmazsanız sunucuya erişemezsiniz!)
ufw allow 22/tcp

# Uygulama portlarını aç
ufw allow 3000/tcp  # Backend
ufw allow 5173/tcp  # Frontend
ufw allow 5432/tcp  # PostgreSQL (sadece local erişim için)
ufw allow 5050/tcp  # pgAdmin

# Durumu kontrol et
ufw status
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

- [ ] Node.js 18+ kurulu
- [ ] Docker ve Docker Compose kurulu
- [ ] PostgreSQL ve pgAdmin container'ları çalışıyor
- [ ] Backend derlenmiş ve servis aktif
- [ ] Frontend derlenmiş ve servis aktif
- [ ] İlk admin girişi başarılı
- [ ] Admin şifresi değiştirildi
- [ ] JWT secret değiştirildi
- [ ] Firewall ayarları yapıldı
- [ ] Otomatik yedekleme aktif

---

**Başarılar! 🎉**

İSG Denetim Sistemi başarıyla kuruldu ve kullanıma hazır!
