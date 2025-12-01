#!/bin/bash

###############################################################################
# İSG Denetim Sistemi - Otomatik Deployment Script
# Versiyon: 1.0.0
# Açıklama: GitHub'dan güncelleme çekip otomatik deployment yapar
###############################################################################

set -e  # Hata durumunda script'i durdur

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Konfigürasyon
PROJECT_DIR="/root/isg_denetim_sistemi"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
LOG_FILE="/var/log/isg-deployment.log"
BACKEND_SERVICE="isg-backend.service"
FRONTEND_SERVICE="isg-frontend.service"
BACKEND_PORT="3000"
FRONTEND_PORT="5173"

# Başlangıç zamanı
START_TIME=$(date +%s)

###############################################################################
# Fonksiyonlar
###############################################################################

# Log mesajı
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Başarı mesajı
success() {
    echo -e "${GREEN}✓ $@${NC}"
    log "SUCCESS" "$@"
}

# Hata mesajı
error() {
    echo -e "${RED}✗ $@${NC}"
    log "ERROR" "$@"
}

# Bilgi mesajı
info() {
    echo -e "${BLUE}ℹ $@${NC}"
    log "INFO" "$@"
}

# Uyarı mesajı
warning() {
    echo -e "${YELLOW}⚠ $@${NC}"
    log "WARNING" "$@"
}

# Adım başlığı
step() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}▶ $@${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}\n"
    log "STEP" "$@"
}

# Komut çalıştır ve logla
run_command() {
    local cmd="$@"
    info "Komut çalıştırılıyor: $cmd"
    if eval "$cmd" >> "$LOG_FILE" 2>&1; then
        success "Komut başarılı: $cmd"
        return 0
    else
        error "Komut başarısız: $cmd"
        return 1
    fi
}

# Dosya hash hesapla
file_hash() {
    if [ -f "$1" ]; then
        md5sum "$1" | awk '{print $1}'
    else
        echo "not_found"
    fi
}

# Servis durumunu kontrol et
check_service() {
    local service=$1
    if sudo systemctl is-active --quiet "$service"; then
        return 0
    else
        return 1
    fi
}

# Health check
health_check() {
    local service_name=$1
    local port=$2
    local max_attempts=10
    local attempt=1

    info "$service_name health check yapılıyor (Port: $port)..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "http://localhost:$port" > /dev/null 2>&1; then
            success "$service_name sağlıklı çalışıyor (Deneme: $attempt/$max_attempts)"
            return 0
        fi
        info "Deneme $attempt/$max_attempts başarısız, bekleniyor..."
        sleep 2
        ((attempt++))
    done

    error "$service_name health check başarısız!"
    return 1
}

###############################################################################
# Ana Script
###############################################################################

# Script başlangıç
echo -e "${PURPLE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          İSG Denetim Sistemi - Otomatik Deployment           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "START" "Deployment başlatıldı"
info "Proje Dizini: $PROJECT_DIR"
info "Log Dosyası: $LOG_FILE"

# Proje dizinine git
step "1/9 - Proje Dizinine Geçiliyor"
if [ ! -d "$PROJECT_DIR" ]; then
    error "Proje dizini bulunamadı: $PROJECT_DIR"
    exit 1
fi
cd "$PROJECT_DIR"
success "Proje dizinine geçildi"

# Git güncelleme kontrolü
step "2/9 - Git Repository Kontrolü"
if [ -d ".git" ]; then
    info "Git repository bulundu, güncelleme çekiliyor..."
    
    # Mevcut branch
    CURRENT_BRANCH=$(git branch --show-current)
    info "Mevcut branch: $CURRENT_BRANCH"
    
    # Git pull
    info "Git pull yapılıyor..."
    if git pull origin "$CURRENT_BRANCH"; then
        success "Git güncelleme başarılı"
    else
        error "Git pull başarısız!"
        exit 1
    fi
else
    warning "Git repository bulunamadı! Git init yapmanız önerilir."
    warning "Deployment git olmadan devam ediyor..."
fi

# Backend package.json kontrolü
step "3/9 - Backend Dependencies Kontrolü"
cd "$BACKEND_DIR"
BACKEND_PACKAGE_HASH_BEFORE=$(file_hash "package.json")
BACKEND_NODE_MODULES_EXISTS=false

if [ -d "node_modules" ]; then
    BACKEND_NODE_MODULES_EXISTS=true
    info "Backend node_modules mevcut"
fi

if [ "$BACKEND_NODE_MODULES_EXISTS" = false ] || [ "$BACKEND_PACKAGE_HASH_BEFORE" != "$(file_hash 'package.json')" ]; then
    info "Backend dependencies yükleniyor..."
    if npm install --legacy-peer-deps; then
        success "Backend dependencies başarıyla yüklendi"
    else
        error "Backend npm install başarısız!"
        exit 1
    fi
else
    info "Backend package.json değişmemiş, npm install atlanıyor"
fi

# Frontend package.json kontrolü
step "4/9 - Frontend Dependencies Kontrolü"
cd "$FRONTEND_DIR"
FRONTEND_PACKAGE_HASH_BEFORE=$(file_hash "package.json")
FRONTEND_NODE_MODULES_EXISTS=false

if [ -d "node_modules" ]; then
    FRONTEND_NODE_MODULES_EXISTS=true
    info "Frontend node_modules mevcut"
fi

if [ "$FRONTEND_NODE_MODULES_EXISTS" = false ] || [ "$FRONTEND_PACKAGE_HASH_BEFORE" != "$(file_hash 'package.json')" ]; then
    info "Frontend dependencies yükleniyor..."
    if npm install --legacy-peer-deps; then
        success "Frontend dependencies başarıyla yüklendi"
    else
        error "Frontend npm install başarısız!"
        exit 1
    fi
else
    info "Frontend package.json değişmemiş, npm install atlanıyor"
fi

# Prisma Migration
step "5/9 - Prisma Database Migration"
cd "$BACKEND_DIR"
if [ -d "prisma" ]; then
    info "Prisma migration yapılıyor..."
    if npx prisma db push; then
        success "Prisma migration başarılı"
    else
        warning "Prisma migration başarısız, devam ediliyor..."
    fi
else
    warning "Prisma dizini bulunamadı, migration atlanıyor"
fi

# Backend Build
step "6/9 - Backend Build"
cd "$BACKEND_DIR"
info "Backend build başlatılıyor..."
if npm run build; then
    success "Backend build başarılı"
else
    error "Backend build başarısız!"
    exit 1
fi

# Frontend Build
step "7/9 - Frontend Build"
cd "$FRONTEND_DIR"
info "Frontend build başlatılıyor..."
if npm run build; then
    success "Frontend build başarılı"
else
    error "Frontend build başarısız!"
    exit 1
fi

# Systemd Servisleri Restart
step "8/9 - Systemd Servisleri Yeniden Başlatılıyor"

# Backend service restart
info "Backend servisi yeniden başlatılıyor..."
if sudo systemctl restart "$BACKEND_SERVICE"; then
    success "Backend servisi yeniden başlatıldı"
else
    error "Backend servisi restart başarısız!"
    exit 1
fi

# Frontend service restart
info "Frontend servisi yeniden başlatılıyor..."
if sudo systemctl restart "$FRONTEND_SERVICE"; then
    success "Frontend servisi yeniden başlatıldı"
else
    error "Frontend servisi restart başarısız!"
    exit 1
fi

# Servis durumlarını kontrol et
info "Servis durumları kontrol ediliyor..."
sleep 3

if check_service "$BACKEND_SERVICE"; then
    success "Backend servisi çalışıyor"
else
    error "Backend servisi çalışmıyor!"
    sudo systemctl status "$BACKEND_SERVICE" --no-pager
    exit 1
fi

if check_service "$FRONTEND_SERVICE"; then
    success "Frontend servisi çalışıyor"
else
    error "Frontend servisi çalışmıyor!"
    sudo systemctl status "$FRONTEND_SERVICE" --no-pager
    exit 1
fi

# Health Check
step "9/9 - Health Check"

# Backend health check
if health_check "Backend" "$BACKEND_PORT"; then
    success "Backend health check başarılı"
else
    warning "Backend health check başarısız (servis çalışıyor ama port yanıt vermiyor)"
fi

# Frontend health check
if health_check "Frontend" "$FRONTEND_PORT"; then
    success "Frontend health check başarılı"
else
    warning "Frontend health check başarısız (servis çalışıyor ama port yanıt vermiyor)"
fi

# Deployment tamamlandı
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "\n${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🎉 DEPLOYMENT BAŞARIYLA TAMAMLANDI! 🎉           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

success "Deployment süresi: ${DURATION} saniye"
success "Backend: http://localhost:$BACKEND_PORT"
success "Frontend: http://localhost:$FRONTEND_PORT"
success "Log dosyası: $LOG_FILE"

log "COMPLETE" "Deployment başarıyla tamamlandı (Süre: ${DURATION}s)"

# Servis loglarını göster
echo -e "\n${CYAN}Son Servis Logları:${NC}"
echo -e "\n${YELLOW}Backend Logs (son 5 satır):${NC}"
sudo tail -5 /var/log/isg-backend.log 2>/dev/null || echo "Log bulunamadı"

echo -e "\n${YELLOW}Frontend Logs (son 5 satır):${NC}"
sudo tail -5 /var/log/isg-frontend.log 2>/dev/null || echo "Log bulunamadı"

echo -e "\n${GREEN}Deployment script tamamlandı!${NC}\n"
