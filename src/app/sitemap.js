
const baseUrl = process.env.NODE_ENV == 'development'? 'http://localhost:3000':'https://twitterxdownload.com';
export default async function sitemap() {
    const staticPages = [
        {
            url: `${baseUrl}/en`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/zh-CN`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/ja`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/ko`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/fr`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/zh-HK`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/downloader`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/tweets`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/about-us`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/terms-of-service`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/creators`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/friends-link`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        }
    ];

    let finalXML = [];

    try {
        let dynamicPages = [];

        const creators = await getAllCreators();
        for(let i = 0;i<creators.length;i++){
            const creator = creators[i];
            dynamicPages.push({
                url: `${baseUrl}/creators/${creator.screen_name}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            })
        }

        const tweets = await getAllTweets();
        for(let i = 0;i<tweets.length;i++){
            const tweet = tweets[i];
            dynamicPages.push({
                url: `${baseUrl}/tweets/${tweet.tweet_id}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            })
        }

        return [...staticPages,...dynamicPages];
    } catch (error) {
        return staticPages;
    }
}
const getAllCreators = async function(){
    try{
        const creatorsResp = await fetch(`${baseUrl}/api/requestdb?action=creators&limit=100`);
        const creatorsData = await creatorsResp.json();
        return creatorsData.data;
    }catch(err){
        return [];
    }
}
const getAllTweets = async function(){
    try{
        const tweetsResp = await fetch(`${baseUrl}/api/requestdb?action=all`);
        const tweetsData = await tweetsResp.json();
        return tweetsData.data;
    }catch(err){
        return [];
    }
}

export const dynamic = 'force-dynamic';
export const revalidate = 86400;