import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

/**
 * Next 16 dropped `next lint`; ESLint 9 runs directly with flat config, and
 * eslint-config-next now ships flat-config exports, so it is imported as-is.
 */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**'] },

  ...(Array.isArray(nextCoreWebVitals) ? nextCoreWebVitals : [nextCoreWebVitals]),

  {
    rules: {
      /**
       * Downgraded to a warning, deliberately.
       *
       * The React Compiler ruleset flags every setState inside an effect. Here
       * that pattern is load-bearing in eleven places and each one is correct:
       * resolving a value that only exists in the browser (timezone, locale,
       * 12/24-hour preference), resetting UI state when a route prop changes,
       * and kicking off the first live-stream poll. Two of them are the very
       * fix for the hydration mismatches removed on 2026-09-14 — rewriting
       * them to satisfy the rule would bring those back.
       *
       * Kept as a warning so new occurrences still surface in review. Where a
       * genuinely better pattern exists we use it: `useMounted()` in
       * lib/hooks/useLocalTime.ts is a useSyncExternalStore, not an effect.
       */
      'react-hooks/set-state-in-effect': 'warn',

      /**
       * Also a warning: its single hit is `window.location.href = …` in the
       * contact form's mailto fallback, which is a navigation, not a mutation
       * of React state.
       */
      'react-hooks/immutability': 'warn',
    },
  },
]

export default config
