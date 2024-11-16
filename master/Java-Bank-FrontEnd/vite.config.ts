import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'


const sslPath = 'ssl';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
	https: {
     key: fs.readFileSync(path.resolve(sslPath, 'public-key.pem')),
     cert: fs.readFileSync(path.resolve(sslPath, 'public.pem')),
    },
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,  
  },
})
