import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 지울 파일을 임시로 옮겨 두는 곳 (CLAUDE.md 파일 삭제 규칙) — 검사하지 않음
    "trash-can/**",
  ]),
]);

export default eslintConfig;
