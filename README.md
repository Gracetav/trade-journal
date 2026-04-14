# 📈 Trade Journal - Prop Firm Edition

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)](https://ejs.co/)

> A premium, high-performance trading journal designed specifically for Prop Firm traders to track their evaluations, funded accounts, and overall ROI with clinical precision.

---

## ✨ Features

- **🚀 Real-time Dashboard**: Track your total PnL, Winrate, and Net Profit at a glance.
- **🏦 Prop Firm Manager**: Monitor multiple accounts (Funded, P1, P2) across different firms like Maven, Goat Funded, etc.
- **📊 Advanced Analytics**: Detailed ROI calculation, monthly growth charts, and spending vs. payout tracking.
- **📸 Trade Logging**: Log every trade with pair, setup, risk, PnL, and even screenshots.
- **⚡ Supabase Integration**: Blazing fast data fetching and secure storage powered by Postgres.
- **🌑 Dark Mode Architecture**: Premium dark interface designed for long trading sessions.

---

## 🛠️ Tech Stack

- **Backend**: Node.js & Express.js
- **Database**: Supabase (Postgres)
- **Frontend Views**: EJS (Embedded JavaScript)
- **CSS Framework**: Modern Vanilla CSS with Glassmorphism
- **Authentication**: Custom Session-based Auth with BCrypt encryption
- **File Handling**: Multer for screenshot uploads

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Supabase Account

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/YourUsername/trade-journal.git

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your credentials:
```env
PORT=3000
DB_HOST=your-supabase-host
DB_USER=postgres
DB_PASS=your-password
DB_NAME=postgres
DB_PORT=5432

NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key
```

### 4. Running the App
```bash
# Start the server
npm run dev
```

---

## 🖼️ Preview

*(Add your stunning screenshots here or use a mockup!)*

---

## 🔒 Security & Privacy
- **Raw SQL Protection**: Using parameterized queries to prevent SQL injection.
- **Encrypted Passwords**: Secure user data with BCrypt hashing.
- **Safe Session Management**: Session-based auth with middleware protection.

---

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License
This project is licensed under the **ISC License**.

---

**Built with ❤️ for Traders. Let's hit that payout! 🤑**
