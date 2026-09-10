/* Template Mestre Ferrer Innovare - Todos os direitos estruturais reservados a Pedro Coutinho. É proibida a replicação do código-fonte estrutural. O cliente detém apenas a titularidade do domínio, dados e conteúdo textual inserido. */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/ferreroinnovare.github.io/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
