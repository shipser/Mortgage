# הוראות התקנה והפעלה בשרת ייצור
# Production Deployment Instructions

## כלי תכנון מימוני לקניית בית
## Home Buying Finance Planning Tool

כלי מקצועי לתכנון מימוני לקניית בית עם חישובים אוטומטיים ושמירה מקומית.
Professional tool for home buying finance planning with automatic calculations and local storage.

## התקנה מהירה / Quick Start

### עם Docker (הכי פשוט):
```bash
# 1. ודא ש-Docker Desktop פועל (Windows/macOS) או Docker daemon (Linux)
docker ps

# 2. בנה והפעל
docker compose up -d

# 3. פתח בדפדפן: http://localhost:8080
```

### ללא Docker:
```bash
npm install
npm run build
# עקוב אחר ההוראות למטה להגדרת שרת
```

---

## דרישות מוקדמות / Prerequisites

### אפשרות א': Docker (מומלץ - הכי פשוט)
### Option A: Docker (Recommended - Simplest)

האפליקציה כוללת הגדרת Docker מוכנה לפריסה. זה הדרך הכי פשוטה ומהירה לפרוס את האפליקציה.
The application includes a ready-to-deploy Docker setup. This is the simplest and fastest way to deploy the application.

#### דרישות:
- Docker (גרסה 20.10 ומעלה)
- Docker Compose (גרסה 2.0 ומעלה) - אופציונלי אבל מומלץ

#### בדיקת התקנה:
```bash
# בדוק גרסת Docker
docker --version

# בדוק גרסת Docker Compose
docker compose version

# בדוק ש-Docker פועל (לא אמור להחזיר שגיאה)
docker ps
```

#### התקנה מהירה:
```bash
# בנה והפעל את הקונטיינר
docker compose up -d

# האפליקציה תהיה זמינה ב: http://localhost:8080
```

**⚠️ חשוב**: ב-Windows/macOS, ודא ש-Docker Desktop פועל לפני הרצת פקודות Docker!

#### פקודות נוספות:
```bash
# בנה את התמונה
docker build -t mortgage-planning-tool .

# הפעל את הקונטיינר
docker run -d -p 8080:80 --name mortgage-app mortgage-planning-tool

# צפה בלוגים
docker logs -f mortgage-app

# עצור את הקונטיינר
docker stop mortgage-app

# הפעל מחדש
docker restart mortgage-app

# מחק את הקונטיינר
docker rm mortgage-app
```

#### עדכון:
```bash
# משוך שינויים חדשים
git pull

# בנה מחדש והפעל
docker-compose up -d --build
```

ראה פרטים נוספים בסעיף "פריסה עם Docker" למטה.
See more details in the "Docker Deployment" section below.

---

### אפשרות ב': התקנה מסורתית
### Option B: Traditional Installation

### 1. התקנת Node.js ו-npm
### Install Node.js and npm

```bash
# בדוק אם Node.js מותקן
node --version

# אם לא מותקן, התקן Node.js (גרסה 18 ומעלה)
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# או הורד מ: https://nodejs.org/
```

### 2. התקנת Git (אם לא מותקן)
### Install Git (if not installed)

```bash
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install git

# בדוק התקנה:
git --version
```

---

## שלב 1: העתקת הפרויקט לשרת
## Step 1: Copy Project to Server

### אפשרות א': העתקה מ-Git
### Option A: Clone from Git

```bash
# נווט לתיקייה שבה תרצה להתקין את הפרויקט
cd /var/www  # או כל תיקייה אחרת

# העתק את הפרויקט
git clone <repository-url> mortgage
cd mortgage
```

### אפשרות ב': העתקה ידנית
### Option B: Manual Copy

```bash
# העתק את כל קבצי הפרויקט לשרת באמצעות SCP או SFTP
# לדוגמה:
scp -r /path/to/mortgage user@server:/var/www/mortgage
```

---

## שלב 2: התקנת תלויות
## Step 2: Install Dependencies

```bash
# נווט לתיקיית הפרויקט
cd /var/www/mortgage

# התקן את כל התלויות
npm install

# או אם אתה משתמש ב-yarn:
# yarn install
```

---

## שלב 3: בניית הפרויקט לייצור
## Step 3: Build for Production

```bash
# בניית הפרויקט לייצור
npm run build

# הקבצים הבנויים יופיעו בתיקייה dist/
```

---

## שלב 4: הפעלת השרת
## Step 4: Running the Server

### אפשרות א': שרת סטטי עם Nginx (מומלץ)
### Option A: Static Server with Nginx (Recommended)

#### 4.1 התקנת Nginx
#### Install Nginx

```bash
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install nginx

# הפעל את Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 4.2 הגדרת Nginx
#### Configure Nginx

צור קובץ הגדרה חדש:
Create a new configuration file:

```bash
sudo nano /etc/nginx/sites-available/mortgage
```

הוסף את התוכן הבא:
Add the following content:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # החלף בכתובת הדומיין שלך
    
    root /var/www/mortgage/dist;
    index index.html;
    
    # תמיכה ב-RTL ועברית
    charset utf-8;
    
    # הגדרות עבור SPA (Single Page Application)
    # חשוב: זה מבטיח שכל הנתיבים יחזרו ל-index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # מניעת גישה לקבצי מקור
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # הגדרות קבצים סטטיים
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # אבטחה
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 4.3 הפעלת ההגדרה
#### Enable Configuration

```bash
# צור קישור סימבולי
sudo ln -s /etc/nginx/sites-available/mortgage /etc/nginx/sites-enabled/

# בדוק את תקינות ההגדרה
sudo nginx -t

# טען מחדש את Nginx
sudo systemctl reload nginx
```

#### 4.4 הגדרת HTTPS עם Let's Encrypt (מומלץ)
#### Setup HTTPS with Let's Encrypt (Recommended)

```bash
# התקן Certbot
sudo apt-get install certbot python3-certbot-nginx

# קבל תעודת SSL
sudo certbot --nginx -d your-domain.com

# Certbot יגדיר אוטומטית HTTPS ויטפל בחידוש התעודה
```

---

### אפשרות ב': שרת Node.js עם PM2
### Option B: Node.js Server with PM2

#### 4.1 התקנת PM2
#### Install PM2

```bash
npm install -g pm2
```

#### 4.2 התקנת שרת סטטי
#### Install Static Server

```bash
npm install -g serve
```

#### 4.3 הפעלת השרת עם PM2
#### Run Server with PM2

```bash
# הפעל את השרת
pm2 serve /var/www/mortgage/dist --name mortgage --spa

# שמור את הרשימה
pm2 save

# הגדר הפעלה אוטומטית בעת אתחול
pm2 startup
# בצע את הפקודה שהפלטה
```

#### 4.4 ניהול השרת
#### Server Management

```bash
# צפה בסטטוס
pm2 status

# צפה בלוגים
pm2 logs mortgage

# הפעל מחדש
pm2 restart mortgage

# עצור
pm2 stop mortgage

# מחק
pm2 delete mortgage
```

---

## שלב 5: הגדרות אבטחה
## Step 5: Security Settings

### 5.1 הרשאות קבצים
### File Permissions

```bash
# הגדר הרשאות נכונות
sudo chown -R www-data:www-data /var/www/mortgage
sudo chmod -R 755 /var/www/mortgage
```

### 5.2 Firewall (אם נדרש)
### Firewall (if needed)

```bash
# Ubuntu/Debian עם UFW:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## שלב 6: עדכון הפרויקט
## Step 6: Updating the Project

### תהליך עדכון
### Update Process

```bash
# נווט לתיקיית הפרויקט
cd /var/www/mortgage

# משוך שינויים חדשים (אם משתמשים ב-Git)
git pull

# עדכן תלויות
npm install

# בנה מחדש
npm run build

# אם משתמשים ב-PM2:
pm2 restart mortgage

# אם משתמשים ב-Nginx:
# אין צורך לעשות כלום - הקבצים הסטטיים כבר עודכנו
```

---

## שלב 7: ניטור ותחזוקה
## Step 7: Monitoring and Maintenance

### 7.1 בדיקת סטטוס
### Status Check

```bash
# Nginx:
sudo systemctl status nginx

# PM2:
pm2 status
pm2 monit
```

### 7.2 לוגים
### Logs

```bash
# Nginx לוגים:
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PM2 לוגים:
pm2 logs mortgage
```

---

## פתרון בעיות נפוצות
## Troubleshooting

### בעיה: האתר לא נטען
### Issue: Site not loading

```bash
# בדוק אם Nginx/PM2 פועל
sudo systemctl status nginx
# או
pm2 status

# בדוק את הלוגים
sudo tail -f /var/log/nginx/error.log
```

### בעיה: שגיאת 404
### Issue: 404 Error

- ודא שהקובץ `index.html` קיים בתיקייה `dist/`
- ודא שההגדרה `try_files` נכונה ב-Nginx

### בעיה: בעיות עם RTL/עברית
### Issue: RTL/Hebrew Problems

- ודא ש-`charset utf-8;` מוגדר ב-Nginx
- בדוק שהקבצים נבנו עם `npm run build`
- ודא שהקובץ `index.html` מכיל `lang="he" dir="rtl"`

### בעיה: LocalStorage לא עובד
### Issue: LocalStorage Not Working

- ודא שהדפדפן תומך ב-localStorage
- בדוק שהאתר רץ על HTTPS או localhost (localStorage דורש זאת בחלק מהדפדפנים)
- בדוק את Console של הדפדפן לשגיאות JavaScript

### בעיה: חישובים לא נכונים
### Issue: Incorrect Calculations

- ודא שכל התלויות מותקנות: `npm install`
- בדוק את Console של הדפדפן לשגיאות
- ודא שהקבצים נבנו מחדש לאחר עדכונים: `npm run build`

---

## סיכום פקודות מהירות
## Quick Command Summary

```bash
# התקנה ראשונית
cd /var/www/mortgage
npm install
npm run build

# עם Nginx:
sudo ln -s /etc/nginx/sites-available/mortgage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# עם PM2:
pm2 serve /var/www/mortgage/dist --name mortgage --spa
pm2 save
pm2 startup

# עדכון:
git pull
npm install
npm run build
pm2 restart mortgage  # אם משתמשים ב-PM2
```

---

## הערות חשובות
## Important Notes

1. **גיבויים**: הקף גיבויים קבועים של התיקייה `dist/` והקבצים המקוריים
2. **תעודות SSL**: מומלץ מאוד להשתמש ב-HTTPS בייצור
3. **ניטור**: הגדר ניטור על השרת (לדוגמה: UptimeRobot, Pingdom)
4. **גרסאות Node.js**: ודא שאתה משתמש בגרסה תואמת (18+)
5. **LocalStorage**: האפליקציה משתמשת ב-localStorage של הדפדפן לשמירת נתונים - אין צורך בבסיס נתונים
6. **SPA (Single Page Application)**: האפליקציה היא SPA - ודא שההגדרה `try_files` ב-Nginx נכונה
7. **RTL Support**: האפליקציה תומכת בעברית ו-RTL - ודא ש-`charset utf-8` מוגדר

---

## פריסה עם Docker
## Docker Deployment

### יתרונות:
- **פשוט ומהיר**: אין צורך בהתקנת Node.js, npm או nginx על השרת
- **עצמאי**: הכל כלול בקונטיינר אחד
- **עקבי**: עובד זהה בכל סביבה
- **קל לתחזוקה**: עדכון פשוט עם rebuild

### שלב 1: התקנת Docker

#### Linux (Ubuntu/Debian):
```bash
# עדכן את רשימת החבילות
sudo apt-get update

# התקן חבילות נדרשות
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# הוסף את מפתח GPG של Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# הוסף את המאגר
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# התקן Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# הפעל את Docker
sudo systemctl start docker
sudo systemctl enable docker

# בדוק התקנה
docker --version
docker compose version
```

#### Windows:
1. הורד והתקן Docker Desktop מ: https://www.docker.com/products/docker-desktop
2. **חשוב**: ודא ש-Docker Desktop פועל לפני הרצת פקודות Docker
   - לחץ על `Windows Key` וחפש "Docker Desktop"
   - הפעל את Docker Desktop וחכה עד שהוא מוכן (אייקון הלוויתן יופיע במגש המערכת)
   - בדוק שההתקנה עובדת: `docker ps` (לא אמור להחזיר שגיאה)

#### macOS:
1. הורד והתקן Docker Desktop מ: https://www.docker.com/products/docker-desktop
2. ודא ש-Docker Desktop פועל לפני הרצת פקודות Docker

### שלב 2: בדיקת דרישות מוקדמות

לפני בניית הקונטיינר, ודא:

```bash
# 1. Docker פועל
docker ps

# 2. קובץ package-lock.json קיים (נדרש ל-npm ci)
ls package-lock.json

# 3. כל קבצי המקור קיימים
ls Dockerfile docker-compose.yml nginx.conf
```

**הערה חשובה**: קובץ `package-lock.json` חייב להיות קיים בפרויקט. אם הוא חסר:
```bash
npm install  # יוצר את package-lock.json
```

### שלב 3: בניית והפעלת הקונטיינר

#### שימוש ב-Docker Compose (מומלץ):
```bash
# נווט לתיקיית הפרויקט
cd /path/to/mortgage

# בנה והפעל את הקונטיינר
docker compose up -d

# או עם docker-compose (גרסה ישנה יותר)
docker-compose up -d

# האפליקציה תהיה זמינה ב: http://localhost:8080
```

#### שימוש ב-Docker בלבד:
```bash
# בנה את התמונה
docker build -t mortgage-planning-tool .

# הפעל את הקונטיינר
docker run -d \
  --name mortgage-app \
  -p 8080:80 \
  --restart unless-stopped \
  mortgage-planning-tool

# האפליקציה תהיה זמינה ב: http://localhost:8080
```

**הערה**: תהליך הבנייה יכול לקחת מספר דקות בפעם הראשונה (הורדת תמונות בסיס והתקנת תלויות).

#### בדיקת תקינות הבנייה:
```bash
# בדוק שהתמונה נבנתה בהצלחה
docker images | grep mortgage-planning-tool

# בדוק שהקונטיינר פועל
docker ps | grep mortgage

# בדוק את ה-health check
curl http://localhost:8080/health
# אמור להחזיר: healthy

# פתח בדפדפן
# http://localhost:8080
```

### שלב 4: הגדרת פורט מותאם אישית

אם תרצה להשתמש בפורט אחר (לדוגמה 3000):
```bash
# עם Docker Compose - ערוך את docker-compose.yml:
# ports:
#   - "3000:80"

# עם Docker:
docker run -d --name mortgage-app -p 3000:80 mortgage-planning-tool
```

### שלב 5: הגדרת HTTPS עם Reverse Proxy

#### עם Nginx כפוך Proxy:
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### עם Traefik:
הוסף labels ל-`docker-compose.yml`:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.mortgage.rule=Host(`your-domain.com`)"
  - "traefik.http.routers.mortgage.entrypoints=websecure"
  - "traefik.http.routers.mortgage.tls.certresolver=letsencrypt"
```

### שלב 6: ניהול הקונטיינר

```bash
# צפה בסטטוס
docker ps | grep mortgage

# צפה בלוגים
docker logs -f mortgage-app

# בדוק את הבריאות
docker inspect --format='{{.State.Health.Status}}' mortgage-app

# עצור את הקונטיינר
docker stop mortgage-app

# הפעל מחדש
docker restart mortgage-app

# מחק את הקונטיינר (לא את התמונה)
docker rm mortgage-app

# מחק את התמונה
docker rmi mortgage-planning-tool
```

### שלב 7: עדכון האפליקציה

```bash
# משוך שינויים חדשים
git pull

# עם Docker Compose:
docker-compose up -d --build

# עם Docker:
docker stop mortgage-app
docker rm mortgage-app
docker build -t mortgage-planning-tool .
docker run -d --name mortgage-app -p 8080:80 --restart unless-stopped mortgage-planning-tool
```

### שלב 8: אופטימיזציה לייצור

#### הגדרת משאבים:
```yaml
# ב-docker-compose.yml:
services:
  mortgage-app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

#### שימוש ב-Multi-stage build:
הקובץ `Dockerfile` כבר משתמש ב-multi-stage build לאופטימיזציה מקסימלית.

### פתרון בעיות Docker:

#### בעיה: Docker Desktop לא פועל (Windows/macOS)
**תסמינים:**
```
ERROR: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**פתרון:**
1. הפעל את Docker Desktop מהתפריט התחל (Windows) או Applications (macOS)
2. חכה עד ש-Docker Desktop מוכן (אייקון הלוויתן במגש המערכת)
3. בדוק שההתקנה עובדת: `docker ps`
4. אם הבעיה נמשכת, הפעל מחדש את המחשב

ראה [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md) לפרטים נוספים.

#### בעיה: שגיאת build - "package-lock.json not found"
**תסמינים:**
```
npm error The `npm ci` command can only install with an existing package-lock.json
```

**פתרון:**
```bash
# ודא שקובץ package-lock.json קיים
ls package-lock.json

# אם חסר, צור אותו:
npm install

# בנה מחדש
docker build -t mortgage-planning-tool .
```

**הערה**: קובץ `.dockerignore` לא צריך לכלול את `package-lock.json` (כבר מתוקן בגרסה הנוכחית).

#### בעיה: שגיאת build - TypeScript errors
**תסמינים:**
```
error TS6133: 'variable' is declared but its value is never read.
```

**פתרון:**
```bash
# בדוק שגיאות TypeScript מקומית לפני build:
npm run build

# אם יש שגיאות, תקן אותן ואז בנה את Docker:
docker build -t mortgage-planning-tool .
```

#### בעיה: הקונטיינר לא מתחיל
```bash
# בדוק את הלוגים
docker logs mortgage-app

# בדוק אם הפורט תפוס
# Windows PowerShell:
netstat -ano | findstr :8080

# Linux/macOS:
netstat -tulpn | grep 8080
# או
lsof -i :8080

# אם הפורט תפוס, שנה את הפורט ב-docker-compose.yml או בפקודת docker run
```

#### בעיה: שגיאת build כללית
```bash
# נקה cache ובנה מחדש
docker build --no-cache -t mortgage-planning-tool .

# או נקה את כל ה-cache של Docker (זהיר - ימחק כל ה-cache):
docker builder prune -a
```

#### בעיה: הקונטיינר קורס
```bash
# בדוק את הלוגים
docker logs --tail 50 mortgage-app

# בדוק את הבריאות
docker inspect mortgage-app | grep -A 10 Health

# בדוק את הסטטוס
docker ps -a | grep mortgage
```

#### בעיה: האפליקציה לא נגישה בדפדפן
```bash
# 1. ודא שהקונטיינר פועל
docker ps

# 2. בדוק את הלוגים
docker logs mortgage-app

# 3. בדוק את ה-health check
curl http://localhost:8080/health

# 4. בדוק שהפורט נכון
docker port mortgage-app
```

### הערות חשובות ל-Docker:

1. **גודל התמונה**: התמונה הסופית קטנה (~50MB) בזכות multi-stage build
2. **אבטחה**: הקונטיינר רץ כ-non-root user (nginx)
3. **בריאות**: הקונטיינר כולל health check אוטומטי
4. **Restart Policy**: מוגדר ל-`unless-stopped` - הקונטיינר יתחיל אוטומטית
5. **לוגים**: הלוגים נשמרים ב-Docker וניתן לצפות בהם עם `docker logs`
6. **package-lock.json**: חייב להיות קיים בפרויקט (לא מוכלל ב-.dockerignore)
7. **TypeScript**: כל שגיאות TypeScript חייבות להיות מתוקנות לפני build מוצלח
8. **Docker Desktop**: ב-Windows/macOS, Docker Desktop חייב להיות פועל לפני הרצת פקודות Docker

### משאבי עזר נוספים:

- **מדריך פתרון בעיות מפורט**: [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)
- **פקודות מהירות**: [DOCKER.md](./DOCKER.md)

---

## תכונות האפליקציה
## Application Features

### תכונות עיקריות:
- הזנת מחיר הבית ותנאי המשכנתא
- ניהול משכורות, חסכונות, הלוואות והוצאות
- הגדרת מס רכישה (דירה ראשונה/שנייה)
- חישובים אוטומטיים של משכנתא מומלצת
- סיכום כולל עם השוואות תשלומים
- חישוב משכורת נוספת נדרשת
- שמירה אוטומטית ב-localStorage
- פונקציית הדפסה מותאמת
- כפתור איפוס נתונים

### טכנולוגיות:
- React 18 + TypeScript
- Tailwind CSS
- Vite
- LocalStorage API

---

## תמיכה
## Support

לשאלות או בעיות, בדוק את הלוגים וקבצי ההגדרה.

For questions or issues, check the logs and configuration files.

### בדיקת תקינות התקנה:
```bash
# בדוק שהקבצים נבנו בהצלחה
ls -la /var/www/mortgage/dist/

# בדוק שהקובץ index.html קיים
cat /var/www/mortgage/dist/index.html | head -20

# בדוק את גרסת Node.js
node --version

# בדוק את גרסת npm
npm --version
```

