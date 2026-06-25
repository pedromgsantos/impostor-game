// Stubs para evitar erros de tipos do vite-plugin-pwa durante o build.
declare module '@vite-pwa/assets-generator/api' {
  const anyApi: unknown;
  export default anyApi;
}

declare module '@vite-pwa/assets-generator/config' {
  const anyCfg: unknown;
  export default anyCfg;
}
