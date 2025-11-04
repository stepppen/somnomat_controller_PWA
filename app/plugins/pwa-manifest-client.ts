export default defineNuxtPlugin(() => {
  if (process.client) {
    // Manually inject manifest link
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.webmanifest';
    document.head.appendChild(link);
  }
})