'use client';
import { Input, Select, SelectItem, Button,Spinner,DatePicker } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";
import { getTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import TweetCard from "@/app/components/ui/TweetCard";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

export default function Tweets({ params: { locale } }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialParams = {
        screen_name: searchParams.get('screen_name'),
        name: searchParams.get('name'),
        text: searchParams.get('text')
    }

    const t = function(key){
        return getTranslation(locale, key);
    }
    const contentTypes = [
        { key: "all", label: t('All') },
        { key: "video", label: t('Video') },
        { key: "image", label: t('Image') },
        { key: "movie", label: t('Movie') }
    ];

    const dateRanges = [
        { key: "all", label: t('All') },
        { key: "today", label: t('Today') },
        { key: "week", label: t('Week') },
        { key: "month", label: t('Month') },
        { key: "quarter", label: t('Quarter') }
    ];

    const [name, setName] = useState(initialParams.name || '');
    const [screen_name, setScreenName] = useState(initialParams.screen_name || '');
    const [text, setText] = useState(initialParams.text || '');
    const [content_type, setContentType] = useState('all');
    const [date_range, setDateRange] = useState('all');
    const [loading, setLoading] = useState(false);
    const [lastCursor, setLastCursor] = useState(null);
    const [tweets, setTweets] = useState([[], [], []]);
    const [canLoadMore,setCanLoadMore] = useState(false);

    const [shouldSearch, setShouldSearch] = useState(name || screen_name || text);

    const [shouldShowAdultNotice, setShouldShowAdultNotice] = useState(true);
    const [nextIndex, setNextIndex] = useState(0);

    useEffect(() => {
        if (shouldSearch) {
            handleSearch();
            setShouldSearch(false);
        }
    }, [shouldSearch]);

    const handleSearch = async ({cursor=null}={}) => {

        if(shouldShowAdultNotice) {
            const confirmed = await ConfirmModal.show({
                title: t('Warning'),
                description: <div className="text-sm text-default-500">
                    <p>{t('Search results may contain adult content. You must be at least 18 years old to continue.')}</p>
                    <DatePicker className="w-full mt-2" label={t('Birth date')} />
                </div>,
                cancelText: t('Cancel'),
                confirmText: t('Confirm')
            });
            if(!confirmed) return;
            setShouldShowAdultNotice(false);
        }

        if(loading) return;
        setLoading(true);

        const params = new URLSearchParams();
        //action=search&name=${name}&screen_name=${screen_name}&text=${text}&content_type=${content_type}&date_range=${date_range}&cursor=${cursor}
        params.set('action','search');
        name && params.set('name',name);
        screen_name && params.set('screen_name',screen_name);
        text && params.set('text',text);
        cursor && params.set('cursor',cursor);

        params.set('content_type',content_type);
        params.set('date_range',date_range);

        const response = await fetch(`/api/requestdb?${params.toString()}`);
        const data = await response.json();

        setCanLoadMore(data.data.length>=20)

        const last = data.data.at(-1);
        if (last) {
            const cursorPayload = JSON.stringify({
                id: last._id,
                post_at: last.post_at,
                ...(last.score !== undefined ? { score: last.score } : {})
            });
            setLastCursor(cursorPayload);
        } else {
            setLastCursor(null);
        }
        
        setTweets(prevTweets => {
            let targetTweets;
            let currentIndex = nextIndex;
    
            if (cursor) {
                targetTweets = prevTweets.map(row => [...row]);
            } else {
                targetTweets = prevTweets.map(() => []);
                currentIndex = 0;
            }
            
            data.data.forEach((tweet) => {
                targetTweets[currentIndex].push({
                    ...tweet,
                    tweet_media: tweet.tweet_media ? tweet.tweet_media.split(',') : []
                });
                currentIndex = (currentIndex + 1) % 3;
            });
            setNextIndex(currentIndex); 
            
            return targetTweets;
        });
        setLoading(false);

        if(!cursor) {
            router.replace(`/tweets?${name ? `name=${name}&` : ''}${screen_name ? `screen_name=${screen_name}&` : ''}${text ? `text=${text}&` : ''}`);
        }
    }

    const handleClear = () => {
        setName('');
        setScreenName('');
        setText('');
        setTweets([[], [], []]);
        setLastCursor(null);
    }

    return (
        <div className="page-container">
            <div className='section'>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-semibold">{t('Search Conditions')}</h2>
                </div>

                <div className="flex w-full gap-4 flex-wrap md:flex-nowrap">
                    <Input
                        disabled={loading}
                        label="Name"
                        variant="bordered"
                        size="sm"
                        radius="lg"
                        className="flex-1 md:w-1/3 min-w-[150px]"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setShouldSearch(true);
                            }
                        }}
                    />

                    <Input
                        disabled={loading}
                        label="Screen Name"
                        variant="bordered"
                        size="sm"
                        radius="lg"
                        className="flex-1 md:w-1/3 min-w-[150px]"
                        value={screen_name}
                        onChange={(e) => setScreenName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setShouldSearch(true);
                            }
                        }}
                    />

                    <Input
                        disabled={loading}
                        label="Text"
                        variant="bordered"
                        size="sm"
                        radius="lg"
                        className="w-full"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setShouldSearch(true);
                            }
                        }}
                    />

                    <Button
                        disabled={loading}
                        color="primary"
                        variant="solid"
                        size="lg"
                        radius="xs"
                        className="px-8 flex-1 md:flex-none"
                        onPress={handleSearch}
                    >
                        {t('Search')}
                    </Button>
                    <Button
                        disabled={loading}
                        color="default"
                        variant="bordered"
                        size="lg"
                        radius="xs"
                        className="px-8 flex-1 md:flex-none"
                        onPress={handleClear}
                    >
                        {t('Clear')}
                    </Button>
                </div>
            </div>
            <div className="section">
                <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
                    <div className='flex items-center gap-2'>{t('Search Results')}{loading && <Spinner className="ml-2" size="sm" color="primary" variant="simple"/>}</div>
                    <div className='flex gap-4 flex-shrink-0'>
                        
                        <div className='w-1/2 min-w-[110px]'>
                            <Select
                                disabled={loading}
                                label={t('Content Type')}
                                variant="underlined"
                                defaultSelectedKeys={["all"]}
                                value={content_type}
                                onChange={(e) => {
                                    setContentType(e.target.value);
                                    setShouldSearch(true);
                                }}
                            >
                                {contentTypes.map((type) => (
                                    <SelectItem key={type.key} value={type.key}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className='w-1/2 min-w-[110px]'>
                            <Select
                                disabled={loading}
                                label={t('Post At')}
                                variant="underlined"
                                defaultSelectedKeys={["all"]}
                                value={date_range}
                                onChange={(e) => {
                                    setDateRange(e.target.value);
                                    setShouldSearch(true);
                                }}
                            >
                                {dateRanges.map((range) => (
                                    <SelectItem key={range.key} value={range.key}>
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </h3>
                {tweets.some(row => row.length > 0) ? (
                    <>
                        <div className="flex justify-between gap-5 mt-8 flex-wrap md:flex-nowrap">
                            {tweets.map((row, index) => (
                                <div key={index} className="w-full md:w-1/3 flex flex-col gap-5">
                                    {row.map((tweet) => (
                                        <TweetCard locale={locale} key={tweet.tweet_id} tweet={tweet} />
                                    ))}
                                </div>
                            ))}
                        </div>
                        {canLoadMore && <div className="flex justify-center">
                            <Button isLoading={loading} isDisabled={loading} color="primary" variant="light" size="lg" radius="xs" className="px-8 mt-4 flex-1 md:flex-none" onPress={() => handleSearch({cursor:lastCursor})}>
                                {t('Load More')}
                            </Button>
                        </div>}
                    </>
                ) : (
                    <div className="text-center py-44 text-default-500">
                        <RiSearchLine size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-sm mt-2">{t('Search results will be displayed here')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}