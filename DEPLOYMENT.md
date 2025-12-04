# הוראות התקנה והפעלה בשרת ייצור
# Production Deployment Instructions

## כלי תכנון מימוני לקניית בית
## Mortgage Planning Tool

כלי מקצועי לתכנון מימוני לקניית בית עם חישובים אוטומטיים ושמירה מקומית.
Professional tool for mortgage planning with automatic calculations and local storage.

## דרישות מוקדמות / Prerequisites

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

