'use client';

import Script from 'next/script';

export default function GoogleAdsense() {
  return (
    <>
      <Script 
        async 
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`}
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />
    </>
  );
}