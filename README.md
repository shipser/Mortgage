# כלי תכנון מימוני לקניית בית (Home Buying Finance Planning Tool)

כלי מקצועי לתכנון מימוני לקניית בית עם חישובים אוטומטיים ושמירה מקומית.

## התחלה מהירה / Quick Start

### עם Docker (מומלץ):
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
npm run dev
# האפליקציה תרוץ על http://localhost:5173
```

## תמונות מסך / Screenshots

### מצב בהיר / Light Mode
![Light Mode Screenshot](./screenshots/light-mode.png)

### מצב כהה / Dark Mode
![Dark Mode Screenshot](./screenshots/dark-mode.png)

## תכונות עיקריות

### הזנת נתונים
- **מחיר הבית**: הזנת מחיר הבית בשקלים חדשים
- **תנאי המשכנתא**: הגדרת משך המשכנתא (שנים) וריבית שנתית ממוצעת
- **משכורות**: הזנת 3 המשכורות האחרונות לכל אחד מבני הזוג
- **חסכונות**: ניהול חסכונות עם שם, סכום כולל, תשואה כוללת, אחוז מס, ומצב (פתוח/סגור)
- **הלוואות**: ניהול הלוואות עם שם, סכום הלוואה, משך (חודשים), תשלום חודשי, וזמינות ככוח קנייה
- **הוצאות**: ניהול הוצאות צפויות (עו"ד, מתווך, ועוד)
- **מס רכישה**: הגדרת מס רכישה (דירה ראשונה/שנייה, עד 6 רמות מס)

### חישובים אוטומטיים

#### חישוב משכנתא
- **כוח החזר**: חישוב על בסיס הכנסה ממוצעת פחות תשלומי הלוואות ארוכות טווח
- **משכנתא מקסימלית לפי כוח החזר**: חישוב על בסיס כוח החזר זמין
- **משכנתא מקסימלית לפי חסכונות והלוואות**: חישוב על בסיס סכום החסכונות והלוואות (×4)
- **משכנתא מקסימלית לפי מחיר הבית**: חישוב על בסיס אחוז מקסימלי מהמחיר (75% לדירה ראשונה, 50% לדירה שנייה)
- **משכנתא מומלצת**: המינימום מבין שלושת הערכים המקסימליים

#### סיכום כולל
- **תשלום חודשי למשכנתא**: חישוב תשלום חודשי למשכנתא המומלצת
- **השוואת תשלומים**: השוואה בין תשלום חודשי למשכנתא מקסימלית לפי מחיר הבית לבין תשלום למשכנתא מומלצת
- **כוח החזר חודשי**: חישוב כוח החזר חודשי זמין והשוואה לתשלום החודשי הנדרש
- **משכורת נוספת נדרשת**: חישוב משכורת נוספת נדרשת (3 × הפרש תשלום) כאשר אין מספיק כוח תשלום
- **סה"כ כספים זמינים**: חישוב כולל של חסכונות נטו, הלוואות זמינות, הוצאות, ומס רכישה
- **סכום חסר**: חישוב הסכום החסר למימון קניית הבית
- **כוח קנייה כולל**: חישוב כוח קנייה כולל והשוואה למחיר הבית

### תכונות נוספות
- **מצב כהה/בהיר**: תמיכה מלאה במצב כהה ובמצב בהיר עם מעבר חלק
- **שמירה אוטומטית**: כל הנתונים נשמרים אוטומטית ב-localStorage
- **איפוס נתונים**: כפתור "נקה הכל" לאיפוס כל הנתונים והחזרה לערכי ברירת מחדל
- **הדפסה**: פונקציית הדפסה מותאמת להדפסת כל המידע
- **תמיכה בעברית**: ממשק מלא בעברית עם תמיכה ב-RTL

## התקנה

```bash
npm install
```

## הרצה בפיתוח

```bash
npm run dev
```

האפליקציה תרוץ על `http://localhost:5173`

## בנייה לייצור

```bash
npm run build
```

הקבצים המהודרים יווצרו בתיקייה `dist/`

## תצוגה מקדימה של בנייה

```bash
npm run preview
```

## פריסה עם Docker

האפליקציה כוללת הגדרת Docker מוכנה לפריסה מהירה וקלה.

### דרישות:
- Docker (גרסה 20.10 ומעלה)
- Docker Compose (גרסה 2.0 ומעלה) - מומלץ

**⚠️ חשוב**: ב-Windows/macOS, ודא ש-Docker Desktop פועל לפני הרצת פקודות Docker!

### הפעלה מהירה:

```bash
# 1. בדוק ש-Docker פועל
docker ps

# 2. בנה והפעל את הקונטיינר
docker compose up -d

# 3. האפליקציה תהיה זמינה ב: http://localhost:8080
```

### פקודות נוספות:

```bash
# בנה את התמונה
docker build -t mortgage-planning-tool .

# הפעל את הקונטיינר
docker run -d -p 8080:80 --name mortgage-app mortgage-planning-tool

# צפה בלוגים
docker logs -f mortgage-app

# בדוק את הבריאות
curl http://localhost:8080/health

# עצור את הקונטיינר
docker stop mortgage-app

# הפעל מחדש
docker restart mortgage-app

# מחק את הקונטיינר
docker rm mortgage-app
```

### פתרון בעיות:

אם נתקלת בבעיות:
- **Docker Desktop לא פועל**: ראה [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)
- **שגיאות build**: ודא ש-`package-lock.json` קיים ו-TypeScript ללא שגיאות
- **פורט תפוס**: שנה את הפורט ב-`docker-compose.yml` או בפקודת `docker run`

### משאבים נוספים:

- **הוראות מפורטות**: [DEPLOYMENT.md](./DEPLOYMENT.md#פריסה-עם-docker)
- **פתרון בעיות**: [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)
- **פקודות מהירות**: [DOCKER.md](./DOCKER.md)

## טכנולוגיות

- **React 18** + **TypeScript** - מסגרת עבודה וטיפוסים
- **Tailwind CSS** - עיצוב מודרני ורספונסיבי עם תמיכה במצב כהה
- **Vite** - כלי בנייה מהיר
- **LocalStorage API** - שמירה מקומית של נתונים
- **Docker** - קונטיינר מוכן לפריסה
- **Nginx** - שרת ווב לייצור (בקונטיינר)

## מבנה הפרויקט

```
mortgage/
├── src/
│   ├── components/          # רכיבי React
│   │   ├── HomePriceInput.tsx
│   │   ├── MortgageTermsInput.tsx
│   │   ├── MortgageSection.tsx
│   │   ├── SalariesInput.tsx
│   │   ├── SavingsList.tsx
│   │   ├── LoansList.tsx
│   │   ├── ExpensesList.tsx
│   │   ├── TaxLevelsInput.tsx
│   │   ├── SummarySection.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── ThemeToggle.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useDarkMode.ts
│   ├── i18n/
│   │   └── hebrew.ts        # כל הטקסטים בעברית
│   ├── types/
│   │   └── mortgage.ts      # הגדרות TypeScript
│   ├── utils/
│   │   └── storage.ts
│   ├── styles/
│   │   └── index.css        # עיצוב גלובלי
│   ├── App.tsx              # רכיב ראשי
│   └── main.tsx             # נקודת כניסה
├── screenshots/             # תמונות מסך
├── Dockerfile               # הגדרת Docker
├── docker-compose.yml       # הגדרת Docker Compose
├── nginx.conf               # הגדרת Nginx
├── .dockerignore            # קבצים לא לכלול ב-Docker
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## הערות

- **שמירה אוטומטית**: כל הנתונים נשמרים אוטומטית ב-localStorage
- **תמיכה בעברית**: הממשק בעברית עם תמיכה מלאה ב-RTL
- **מצב כהה/בהיר**: תמיכה מלאה במצב כהה ובמצב בהיר עם מעבר חלק
- **חישובים**: מבוססים על נוסחאות פיננסיות סטנדרטיות
- **הדפסה**: התצוגה מותאמת להדפסה עם עיצוב מותאם
- **פריסה**: תמיכה מלאה בפריסה עם Docker או ללא Docker

## פריסה לייצור

להנחיות מפורטות לפריסה לייצור, ראה:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - הוראות מפורטות לפריסה
- **[DOCKER.md](./DOCKER.md)** - פקודות Docker מהירות
- **[DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)** - פתרון בעיות Docker

## פיתוח עתידי

- שילוב אלגוריתמי חישוב מתקדמים
- גרפים וויזואליזציה של נתונים
- שמירה וטעינה של קבצי תצורה
- תמיכה בשפות נוספות
- ייצוא נתונים ל-PDF/Excel

## רישיון / License

פרויקט זה זמין לשימוש חופשי.

## תמיכה / Support

לשאלות או בעיות:
1. בדוק את [DEPLOYMENT.md](./DEPLOYMENT.md) להוראות פריסה
2. ראה [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md) לפתרון בעיות Docker
3. בדוק את הלוגים והשגיאות בקונסולה
