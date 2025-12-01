# İSG Denetim Sistemi - Hızlı Kurulum Özeti

## Hızlı Başlangıç (Root Kullanıcısı)

### 1. Gerekli Paketler
```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Docker
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl start docker && systemctl enable docker

# Build tools
apt install -y build-essential chromium-browser
```

### 2. Docker (PostgreSQL + pgAdmin)
```bash
cd /home/ubuntu/isg_denetim_sistemi/docker
docker compose up -d
```

### 3. Backend
```bash
cd /home/ubuntu/isg_denetim_sistemi/backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run build
```

### 4. Frontend
```bash
cd /home/ubuntu/isg_denetim_sistemi/frontend
npm install
cp .env.example .env
npm run build
npm install -g serve
```

### 5. Systemd Servisleri
```bash
cp systemd/*.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now isg-backend isg-frontend
systemctl status isg-backend isg-frontend
```

## Erişim

- **Frontend**: http://SUNUCU_IP:5173
- **Backend API**: http://SUNUCU_IP:3000/api
- **pgAdmin**: http://SUNUCU_IP:5050

## Varsayılan Giriş

- **Kullanıcı**: admin
- **Şifre**: Admin123!

## Port Yapılandırması

- **Frontend**: 5173
- **Backend**: 3000
- **PostgreSQL**: 5432
- **pgAdmin**: 5050

## Önemli Dosyalar

- Backend .env: `/home/ubuntu/isg_denetim_sistemi/backend/.env`
- Frontend .env: `/home/ubuntu/isg_denetim_sistemi/frontend/.env`
- Docker Compose: `/home/ubuntu/isg_denetim_sistemi/docker/docker-compose.yml`

## Servis Yönetimi

```bash
# Durumu kontrol et
systemctl status isg-backend
systemctl status isg-frontend

# Yeniden başlat
systemctl restart isg-backend
systemctl restart isg-frontend

# Logları gör
tail -f /var/log/isg-backend.log
tail -f /var/log/isg-frontend.log
```

## Sorun Giderme

1. **Backend bağlanmıyor**: Database URL'i kontrol edin
2. **Frontend boş sayfa**: API URL'i kontrol edin (.env)
3. **Docker çalışmıyor**: `docker compose restart`
4. **Port meşgul**: `netstat -tulpn | grep PORT`

Detaylı bilgi için **README.md** dosyasına bakın!
