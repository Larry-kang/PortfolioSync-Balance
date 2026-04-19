# 專案特定規則 (Project Rules)

> **規則繼承**: 此專案自動繼承自 `d:\Dev\GitHub\.agent\rules\global_rules.md` 的所有通用規範。

## 1. 技術棧 (Tech Stack)
- 主要語言: TypeScript / React
- 框架: Vite
- UI: Tailwind CSS CDN utility classes, Recharts, lucide-react
- 外部服務: Google Sheets API, Gemini API

## 2. 專案規範 (Project Specifics)
- 這是前端單頁應用；優先保持 `npm run build` 可通過。
- 投資組合數值輸入必須避免寫入 `NaN`。
- CSV 匯入/匯出欄位需與 Google Sheets 同步欄位維持相容。
- 不要提交 `.env.local` 或任何 API key。
- Gemini API key 目前仍會進入前端 bundle；正式部署前應改為後端/API proxy。
