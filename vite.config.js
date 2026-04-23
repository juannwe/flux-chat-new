import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/flux-chat-new/",
  plugins: [react()],
})