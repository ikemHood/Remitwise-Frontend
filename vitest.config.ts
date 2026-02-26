import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: ['lib/contracts/**/*.test.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/contracts/**/*.ts'],
      exclude: ['lib/contracts/**/*.test.ts']
    },
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
