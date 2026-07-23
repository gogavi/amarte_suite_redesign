/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMARTE_CHATBOT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
