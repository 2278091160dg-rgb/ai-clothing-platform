/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_PROXY_URL: string
  readonly VITE_N8N_WEBHOOK_PATH: string
  readonly VITE_DEERAPI_URL: string
  readonly VITE_DEERAPI_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
