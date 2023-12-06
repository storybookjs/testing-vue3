/// <reference types="vite" />
import path from "path";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'

const fileName = {
  es: `index.mjs`,
  cjs: `index.cjs`,
  iife: `index.iife.js`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

export default defineConfig({
  base: "./",
  plugins: [dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: 'index',
      formats,
      fileName: (format) => fileName[format],
    },
    rollupOptions: {
      external: [
        /^@storybook\/.*/,
      ]
    }
  },
  test: {

  }
});