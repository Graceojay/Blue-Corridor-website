/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/alignment-lab', destination: '/alignmentlab', permanent: true },
      { source: '/alignment-lab.html', destination: '/alignmentlab', permanent: true },
      { source: '/executive-advisory', destination: '/executiveadvisory', permanent: true },
      { source: '/executive-advisory.html', destination: '/executiveadvisory', permanent: true },
      { source: '/legacy-advisory', destination: '/legacyadvisory', permanent: true },
      { source: '/legacy-advisory.html', destination: '/legacyadvisory', permanent: true },
      { source: '/chapters-project', destination: '/chaptersproject', permanent: true },
      { source: '/chapters-project.html', destination: '/chaptersproject', permanent: true },
      { source: '/speaking.html', destination: '/speaking', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/founder.html', destination: '/founder', permanent: true },
    ]
  },
}

export default nextConfig
