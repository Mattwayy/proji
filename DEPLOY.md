# Деплой Proji на Vercel

## Статус готовности (проверено 2026-06-21)

- ✅ `npx next build` проходит чисто, все 62 роута собираются (статика + 5 server routes).
- ✅ `npx tsc --noEmit` чист, кроме одной известной ошибки (см. ниже).
- ⚠️ **Известная проблема: `trustHost` в `src/lib/auth.ts`.** Поле `trustHost: true` добавлено как workaround для `next-auth@4.24.14` + Next.js 16 (без него вход падает с `Configuration error` на проде, т.к. NextAuth v4 не доверяет host-заголовку Vercel/прокси по умолчанию). Проблема: типы `next-auth` v4 не объявляют это поле, поэтому `tsc --noEmit` падает на этой строке. Сборка не ломается только потому что в `next.config.ts` стоит `typescript: { ignoreBuildErrors: true }` — **это маскирует и любые будущие реальные ошибки типов**, не только эту. Рекомендация на следующий этап: либо обновить `next-auth` до v5 (Auth.js, нативно поддерживает Next 16 и трактует `trustHost` правильно), либо завести локальный `.d.ts` augmentation для `AuthOptions`, и затем убрать `ignoreBuildErrors`.
- ✅ Пройден аудит доступности (screen-reader proxy через accessibility tree): добавлены ARIA-роли/labels на интерактивные элементы в `app/chat`, `app/messages`, `src/components/ContextSidebar.tsx`, `Sidebar.tsx`, `Topbar.tsx`, `AppLauncher.tsx`, `login/page.tsx`, добавлен skip-link и landmark `<main>`. Подробности и оставшийся долг — см. `ROADMAP_NEXT_STAGES.md`.

## Требования
- Аккаунт на [vercel.com](https://vercel.com)
- Аккаунт на [GitHub](https://github.com) (для автодеплоя)
- API-ключ Gemini: [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

## Шаг 1 — Загрузить проект на GitHub

```bash
# В папке проекта
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/proji.git
git push -u origin main
```

> `data/credentials.json` в `.gitignore` — не попадёт в репозиторий. Это правильно.

---

## Шаг 2 — Создать проект на Vercel

1. Открыть [vercel.com/new](https://vercel.com/new)
2. Нажать **Import Git Repository** → выбрать `proji`
3. Framework: **Next.js** (определится автоматически)
4. **Не нажимать Deploy** — сначала настроить переменные окружения

---

## Шаг 3 — Настроить переменные окружения

В Vercel: **Project Settings → Environment Variables**

Добавить следующие переменные:

### Обязательные

| Имя переменной | Значение | Как получить |
|---------------|----------|-------------|
| `NEXTAUTH_SECRET` | Сгенерировать | `openssl rand -base64 32` в терминале |
| `NEXTAUTH_URL` | URL вашего деплоя | Например `https://proji.vercel.app` |
| `GEMINI_API_KEY` | Ключ Gemini | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `CREDS_JSON` | JSON со всеми учётными данными | Инструкция ниже |

### Как сгенерировать CREDS_JSON

В терминале в папке проекта:

```bash
node -e "const f=require('./data/credentials.json');console.log(JSON.stringify(f))"
```

Скопировать вывод целиком (одна строка) и вставить в поле `CREDS_JSON` на Vercel.

**Перед этим измените пароли и ключи!** Текущие значения в `credentials.json` — дефолтные:
- Менеджер: `admin@proji.com` / нужен оригинальный пароль
- Работник: `employer@proji.com` / нужен оригинальный пароль

Чтобы сгенерировать новый bcrypt-хэш для пароля:
```bash
node -e "const b=require('bcryptjs');b.hash('НОВ_ПАРОЛЬ',10).then(h=>console.log(h))"
```

---

## Шаг 4 — Задеплоить

1. Нажать **Deploy** в интерфейсе Vercel
2. Дождаться завершения сборки (~2-3 минуты)
3. Открыть ссылку вида `https://proji-xxx.vercel.app`

---

## Шаг 5 — Проверить после деплоя

- [ ] Открывается главная страница `/`
- [ ] Страница логина `/login` работает
- [ ] Можно войти под менеджером
- [ ] AI-чат отвечает (проверить `/chat`)
- [ ] Страница проектов `/projects` работает
- [ ] Навигация между разделами работает

---

## Автоматический деплой

После первого деплоя каждый `git push` в `main` автоматически триггерит новый деплой на Vercel.

Для preview-деплоев — пушить в отдельную ветку:
```bash
git checkout -b feature/something
git push origin feature/something
# Vercel создаст preview URL для этой ветки
```

---

## Обновление NEXTAUTH_URL

После деплоя Vercel показывает финальный URL. Если он отличается от заданного:
1. Vercel → Project Settings → Environment Variables
2. Обновить `NEXTAUTH_URL` на реальный URL
3. Нажать **Redeploy** (без изменений кода)

---

## Устранение проблем

### Build failed: Cannot find module 'fs'
`credentials.ts` теперь использует `fs` только в dev-режиме. Если ошибка появляется — убедитесь что `CREDS_JSON` задан в переменных окружения.

### 500 при входе / Authentication error
- Проверить что `NEXTAUTH_SECRET` задан и содержит не менее 32 символов
- Проверить что `CREDS_JSON` — корректный JSON (вставить в [jsonlint.com](https://jsonlint.com) для проверки)
- Проверить что `NEXTAUTH_URL` совпадает с реальным URL деплоя

### AI не отвечает
- Проверить `GEMINI_API_KEY` в настройках Vercel
- Убедиться что ключ активен и не исчерпан лимит
- Проверить лимит `maxDuration: 30` в `vercel.json` — AI запросы могут занимать до 30 сек

### Domain key updates не сохраняются
Ожидаемое поведение. Vercel — serverless, файловая система read-only. Изменения ключей домена работают только локально. Для production — подключить базу данных (см. `MIGRATION_GUIDE.md`).

---

## Переменные окружения: сводка

```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<32+ символа, случайная строка>
GEMINI_API_KEY=<ключ из AI Studio>
CREDS_JSON=<JSON из data/credentials.json, одной строкой>
```
