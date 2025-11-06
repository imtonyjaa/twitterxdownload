import SiteConfig from '@/siteconfig.json';

export async function generateMetadata({ params }) {
    const title = 'Search Tweets'
    const description = 'Search trending Twitter users and tweets, rewrite viral content with AI, and publish at the perfect time. Master Twitter marketing with data-driven insights.';
    
    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        type: 'website',
        url: `https://${SiteConfig.domain}/`,
        siteName: SiteConfig.title,
        images: [{
          url: `https://${SiteConfig.domain}/images/og.png`
        }]
      },
      twitter: {
        card: 'summary_large_image',
        site: `@${SiteConfig.domain}`,
        title: title,
        description: description,
        images: [`https://${SiteConfig.domain}/images/og.png`]
      }
    }
}

export default function RootLayout({ children }) {
    return (
        children
    );
}