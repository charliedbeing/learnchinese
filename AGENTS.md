# AGENTS.md

Chinese flashcard SPA (Vite + React 19 + TypeScript + Tailwind 3), deployed to GitHub Pages.

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build (typechecks first) | `npm run build` (`tsc -b && vite build`) |
| Lint | `npm run lint` |
| Deploy to GitHub Pages | `npm run deploy` (`gh-pages -d dist`) |

There is no test suite and no CI workflow. Verify changes with `npm run build` — `tsc -b` with `strict`, `noUnusedLocals`, and `noUnusedParameters` is the only safety net.

## Architecture

- [src/main.tsx](src/main.tsx) renders **one** component: `ChineseFlashcardApp` from [src/components/update/version3/ChineseFlashcard.tsx](src/components/update/version3/ChineseFlashcard.tsx). The whole UI lives in that single file.
- `src/components/update/version1/` and `version2/` are **historical snapshots, not active code**. Do not edit them. Do not "fix" or refactor them; never switch `main.tsx` to point at them without being asked.
- When making a substantial feature change, follow the existing pattern: copy `version3/` to a new `version4/` folder and repoint the import in [src/main.tsx](src/main.tsx), rather than rewriting `version3` in place. For small fixes, edit `version3` directly.
- [src/App.css](src/App.css) is leftover Vite boilerplate and is unused. Styling is Tailwind utility classes only; [src/index.css](src/index.css) holds just the `@tailwind` directives.
- `base: '/learnchinese/'` in [vite.config.ts](vite.config.ts) is required for GitHub Pages — do not remove it. Reference assets with relative paths or `import.meta.env.BASE_URL`, never a hardcoded leading `/`.

## Vocabulary data

Decks live in [src/components/data/](src/components/data/) and are **statically imported** (`resolveJsonModule`), not fetched or glob-loaded. Every deck file is an array of:

```ts
interface VocabularyItem {
  id: number; hanzi: string; pinyin: string; english: string;
  sentence: string; sentencePinyin: string; sentenceMeaning: string;
}
```

[quote.json](src/components/data/quote.json) is a separate shape: `{ text: string; author: string }[]`.

To add a deck: create the JSON file, add an `import` at the top of `version3/ChineseFlashcard.tsx`, and append an entry to the `vocabularySets` array (`{ id: 'batchN', label: '…', data: … }`). `id` must be unique; `label` is user-facing and may be Chinese. All three steps are required — an unreferenced JSON file silently does nothing.

`id` values within a deck must be ascending: the jump-to-ID input assumes `data[0].id` is the min and the last element's `id` is the max.

## Conventions

- State is plain `useState`/`useEffect` in the one component. No context, no store, **no localStorage/sessionStorage** — progress intentionally resets on reload. Don't introduce persistence unasked.
- Audio uses the native Web Speech API (`window.speechSynthesis`), with a Chinese voice picked from `voices` by `lang` (`zh-CN`/`zh-TW`) or name. Rate is `0.6` slow / `0.9` normal. Voices load asynchronously — keep the `voiceschanged` handling intact.
- Icons come from `lucide-react`. Prefer an existing icon in the file over adding a dependency.
- UI chrome is English; deck labels, quotes, and footer text may be Chinese. There is no i18n framework — strings are inline.

[README.md](README.md) is still the unmodified Vite template and is not a source of truth for this project.
