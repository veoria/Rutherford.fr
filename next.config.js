/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/products.html', destination: '/#colorloop', permanent: true },
      {
        source: '/products-cip3-preset-and-closed-loop-for-packaging-commercial-printer-offset-sheetfed.html',
        destination: '/#colorloop',
        permanent: true,
      },
      { source: '/segmentation.html', destination: '/#colorloop', permanent: true },
      { source: '/how-it-works.html', destination: '/#how', permanent: true },

      { source: '/consolevalidation.html', destination: '/console-validation', permanent: true },
      { source: '/console-validation.html', destination: '/console-validation', permanent: true },
      { source: '/support.html', destination: '/support', permanent: true },

      // Short link for social bios / posts → console validation
      { source: '/check', destination: '/console-validation', permanent: false },

      { source: '/success-story-from-rutherford-xrite-pantone.html', destination: '/#cases', permanent: true },
      { source: '/phillips.html', destination: '/#cases', permanent: true },
      { source: '/vms-print-moscow-russia.html', destination: '/#cases', permanent: true },

      { source: '/blog.html', destination: '/blog', permanent: true },
      { source: '/whats-about-extended-gamut.html', destination: '/blog/extended-gamut-from-lefrancq', permanent: true },

      // Catch-all for legacy *.html URLs — but never swallow the Google
      // Search Console verification file (served statically from /public).
      { source: '/:path((?!google[0-9a-f]+).*).html', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
