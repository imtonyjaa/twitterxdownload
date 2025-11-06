import { getTranslation } from "@/lib/i18n";
import { headers } from 'next/headers'
import { Avatar, Button, Chip, Link } from "@heroui/react";
import TweetCard from '@/app/components/ui/TweetCard';
import { RiSearchLine, RiTwitterXFill,RiCalendar2Line } from "@remixicon/react";
import SiteConfig from '@/siteconfig.json';

async function getCreatorData(screen_name) {
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const baseUrl = `${protocol}://${host}`
    const detailResp = await fetch(`${baseUrl}/api/requestdb?action=creator&screen_name=${screen_name}`);
    const data = await detailResp.json();

    return data;
}

export async function generateMetadata({ params }) {
    const result = await getCreatorData(params.screen_name);
    const creator = result.data;

    const title = creator.name;
    const description = getCreatorBio(creator) || 'Discover the most popular Twitter/X creators and explore their content on TwitterXDownload.';

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

function getCreatorBio(creator) {
    try {
        const tweet_data = JSON.parse(creator.tweet_data);

        let data_entries;
        for (const instruction of tweet_data.data.threaded_conversation_with_injections_v2.instructions) {
            if (instruction.entries) {
                data_entries = instruction.entries;
                break;
            }
        }

        const resultTweet = data_entries[0].content.itemContent.tweet_results.result;

        const user = resultTweet.core?.user_results?.result?.legacy || resultTweet.tweet.core?.user_results?.result?.legacy;

        return user;
    } catch (err) {
        return '';
    }
}

export default async function CreatorDetail({ params }) {
    const { screen_name, locale = 'en' } = params;
    const t = function (key) {
        return getTranslation(locale, key);
    }

    const result = await getCreatorData(params.screen_name);
    const creator = result.data;
    const total_count = result.count || 0;

    const creatorInfo = getCreatorBio(creator);
    const description = creatorInfo?.description || '';
    const profile_image_hd = creatorInfo?.profile_image_url_https?.replace('_normal', '');

    const tweet = {
        ...creator,
        tweet_media: creator.tweet_media ? creator.tweet_media.split(',') : []
    }

    const formatNumber = (num) => {
        if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
        return num;
    }

    const entitiesToLinks = (text, entities) => {
        let linkedText = text;
        if (entities && entities.urls) {
            entities.urls.forEach(urlEntity => {
                const url = urlEntity.url;
                const expandedUrl = urlEntity.expanded_url;
                const displayUrl = urlEntity.display_url;
                const link = `<a href="${expandedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${displayUrl}</a>`;
                linkedText = linkedText.replace(url, link);
            });
        }
        return linkedText;
    }

    const convertUrlsToLinks = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>`);
    }

    return (
        <div className="page-container py-20">
            <div className="mx-auto max-w-[600px] w-full flex flex-col items-center justify-center">
                <div className="w-full flex flex-col items-start justify-center">
                    <div className="text-[20px] text-foreground font-bold">{creator.name}</div>
                    <div className="text-[13px] text-foreground/50">{formatNumber(creatorInfo.statuses_count)} posts</div>
                </div>
                <img src={creatorInfo?.profile_banner_url || ''} alt={`${creator.name} banner`} className="mt-1 w-full h-auto object-cover" />
                <div className='border-[1px] border-foreground/20 pb-2 w-full flex flex-col items-start px-4'>
                    <div className="w-full flex flex-row justify-between">
                        <Avatar disableAnimation isBordered src={profile_image_hd || ''} name={creator.name} alt={`${creator.name} avatar`} size="lg" radius="full" className="w-[120px] h-[120px] -mt-[60px]"/>
                        <Button as={Link} href={`https://x.com/intent/follow?screen_name=${screen_name}`} target="_blank" color='primary' radius="full" variant="solid" className="mt-2 bg-foreground text-background font-bold" startContent={<RiTwitterXFill className='w-4 h-4' />}>{t('Follow')}</Button>
                    </div>
                    <div className="flex flex-col gap-1 pt-3 flex-1 overflow-hidden items-start">
                        <h1 className="text-foreground overflow-hidden text-ellipsis whitespace-nowrap text-[20px] font-bold">{creator.name}</h1>
                        <p className="text-[15px] text-default-400 overflow-hidden text-ellipsis whitespace-nowrap">@{creator.screen_name}</p>
                        {description && <pre className='w-full mt-2 text-foreground rounded-md text-wrap' dangerouslySetInnerHTML={{__html:entitiesToLinks(description,creatorInfo.entities.description)}}></pre>}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-foreground/50 text-[14px]">
                        <RiCalendar2Line className="w-4 h-4"/>Joined {new Date(creatorInfo.created_at).toLocaleDateString(locale, { year: 'numeric', month: 'long' })}
                    </div>
                    <div className="mt-2">
                        <span className="text-[14px] font-bold text-foreground">{formatNumber(creatorInfo.friends_count)}</span><span className="text-foreground/50 ml-2 text-[14px]">Following</span>
                        <span className="text-[14px] font-bold text-foreground ml-6">{formatNumber(creatorInfo.followers_count)}</span><span className="text-foreground/50 ml-2 text-[14px]">Followers</span>
                    </div>
                </div>
                <div className='w-full flex flex-col gap-4 mt-4'>
                    <div className="w-full flex flex-row gap-2">
                        <Button as={Link} href={`/tweets?screen_name=${screen_name}`} size="lg" color='primary' variant="solid" startContent={<RiSearchLine className='w-4 h-4' />} className="w-full">{t('Search')}</Button>
                    </div>
                    <div className="w-full flex flex-row justify-between items-center px-2">
                        <div>{t('Recent Tweet')}</div>
                        <div className="text-foreground/50 text-[14px]">{total_count}</div>
                    </div>
                    <TweetCard className='w-full' tweet={tweet} locale={locale} enableEdit={false} />
                </div>
            </div>
        </div>
    )
}