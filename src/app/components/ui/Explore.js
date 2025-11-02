'use client';

import { useEffect, useState } from 'react';
import { getTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { Skeleton } from '@heroui/react';

export default function Explore({locale = 'en'}) {
    const t = function(key){
        return getTranslation(locale, key);
    }
    const [tweets, setTweets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetch('/api/requestdb?action=random',{
            cache: 'no-store'
        })
        .then(response => response.json())
        .then(data => {
            setTweets(data.data);
        })
        .catch(error => {
            console.error('Error fetching tweets:', error);
        });
    }, []);

    if (tweets.length === 0) {
        return (
            <div className="border-foreground/10 border-[1px] rounded-2xl p-8 bg-[#f8f8f8] dark:bg-foreground/5">
            <div className="text-medium font-semibold">{t('Explore')}</div>
            <div className="w-full h-[1px] bg-foreground/10 mt-3"></div>
            <div className="flex flex-col gap-2 mt-4">
                {[0,1,2,3,4,5,6,7,8,9].map((random) => (
                    <Skeleton className="w-full h-[24px]" key={random}/>
                ))}
            </div>
        </div>
        );
    }

    return (
        <div className="border-foreground/10 border-[1px] rounded-2xl p-8 bg-[#f8f8f8] dark:bg-foreground/5">
            <div className="text-medium font-semibold">{t('Explore')}</div>
            <div className="w-full h-[1px] bg-foreground/10 mt-3"></div>
            <div className="flex flex-col gap-2 mt-4">
                {tweets.map((random) => (
                    <Link href={`/tweets/${random.tweet_id}`} key={random.tweet_id} className="text-small text-foreground/80 line-clamp-2 hover:underline">
                        {random.tweet_text}
                    </Link>
                ))}
            </div>
        </div>
    )
}