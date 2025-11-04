export const useManifest = () => {
  useHead({
    link: [
      {
        rel: 'manifest',
        href: '/manifest.webmanifest'
      }
    ]
  })
}