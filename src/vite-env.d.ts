/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMARTE_CHATBOT_URL?: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_WOMPI_CHECKOUT_URL?: string;
  readonly VITE_WHATSAPP_RESERVAS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
