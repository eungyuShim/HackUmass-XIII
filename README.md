# Canvas Grade Planner

> AI-powered grade planning tool for Canvas LMS. Calculate minimum scores needed to achieve your target grade.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

- 🔐 **Canvas LMS Integration** - Secure token-based authentication
- 🤖 **AI Syllabus Parser** - Claude Sonnet 4.5 powered PDF extraction
- 📈 **Smart Calculations** - Two strategic distribution modes (Equal/Proportional)
- ⚡ **Real-time Sync** - Live grade updates with SWR caching
- 🎯 **Interactive Dashboard** - Slider-based score adjustment
- 💾 **Persistent State** - Zustand + localStorage for seamless UX

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Canvas Personal Access Token ([How to get](https://community.canvaslms.com/t5/Admin-Guide/How-do-I-manage-API-access-tokens-as-an-admin/ta-p/89))
- Claude API Key ([Get here](https://console.anthropic.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/eungyuShim/HackUmass-XIII.git
cd HackUmass-XIII/GradePlanner

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Add your CLAUDE_API_KEY to .env.local

# Run development server
npm run dev
```

Visit **http://localhost:3000**

### Getting Canvas Token

1. Login to Canvas → **Account** → **Settings**
2. Scroll to **Approved Integrations**
3. Click **+ New Access Token**
4. Enter purpose: "Grade Planner"
5. **Generate Token** and copy immediately

Format: `{user_id}~{token}` (e.g., `20972~ZMkk4PvX...`)

## 📖 How It Works

1. **Authenticate** - Enter Canvas Personal Access Token
2. **Select Course** - Choose from your active courses
3. **Setup (Optional)** - Upload PDF syllabus for AI parsing or configure manually
4. **Plan** - View real-time grade calculations with two strategies:
   - **Equal Distribution**: Spread burden equally across remaining assignments
   - **Proportional**: Weight-based distribution
5. **Adjust** - Use sliders to set target scores and see live recalculation

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand, SWR
- **Backend**: Next.js API Routes, Claude API (Sonnet 4.5), pdf-parse
- **Testing**: Vitest
- **Deployment**: Vercel

## 🔐 Security

- ✅ Tokens stored client-side only (localStorage)
- ✅ All Canvas API calls proxied through Next.js
- ✅ HTTPS enforced in production
- ✅ No server-side token storage
- ✅ Auto-logout on 401 errors

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/eungyuShim/HackUmass-XIII)

1. Click deploy button
2. Add environment variable: `CLAUDE_API_KEY`
3. Deploy!

### Manual

```bash
npm run build
npm start
```

## 🗺️ Roadmap

- [ ] Drop lowest/highest policy support
- [ ] Export grade plan (PDF/CSV)
- [ ] Grade history tracking
- [ ] Mobile app (React Native)
- [ ] Multi-LMS support (Moodle, Blackboard)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👥 Team

Built with ❤️ at **HackUMass XIII 2025**

- [Eungyu Shim](https://github.com/eungyuShim)
- [Jongchan](https://github.com/xxjcpark)
- [Jooyoung](https://github.com/youngh82)

## 📞 Support

- 🐛 [Report Bug](https://github.com/eungyuShim/HackUmass-XIII/issues)
- 💡 [Request Feature](https://github.com/eungyuShim/HackUmass-XIII/issues)
- 📖 [Documentation](https://github.com/eungyuShim/HackUmass-XIII)

---

**Last Updated**: November 9, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
