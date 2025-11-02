'use client';

import { addToast,Button } from "@heroui/react";
import { RiDownloadLine,RiFileCopyLine,RiTwitterXLine,RiFacebookFill,RiRedditLine } from "@remixicon/react";
import Utils from "@/lib/utils"
import { autoTranslation as t } from "@/lib/i18n";
import { useState } from "react";

export default function ShareButtons({tweets=[]}) {

    const [isDownloading,setIsDownloading] = useState(false);

    const handleCopy = () => {
        const articleContent = document.querySelector('.article-content');
        if (!articleContent) return;
        
        document.addEventListener('copy', function(e) {
            e.clipboardData.setData('text/html', articleContent.innerHTML);
            e.clipboardData.setData('text/plain', articleContent.innerHTML);
            e.preventDefault();

            addToast({
                title: t('Copied'),
                color: 'success',
                hideCloseButton: true,
                shouldShowTimeoutProgress: true,
                variant: 'bordered',
            });
        });
        document.execCommand('copy');
    }
    const handleShareToTwitter = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?url=${url}`, '_blank');
    }
    const handleShareToFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
    const handleShareToReddit = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.reddit.com/submit?url=${url}`, '_blank');
    }
    const handleDownloadAll = async () =>{
        setIsDownloading(true);
        await Utils.downloadAllMedia(tweets);
        setIsDownloading(false);
    }

    return (
        <div className="flex flex-row gap-1 mt-6 justify-between">
            <Button isIconOnly color="primary" size="md" title="Copy" aria-label="Copy" onPress={handleCopy}>
                <RiFileCopyLine className="w-5 h-5"/>
            </Button>
            <Button isDisabled={isDownloading} isLoading={isDownloading} isIconOnly color="primary" size="md" title="Download All" aria-label="Download All" onPress={handleDownloadAll}>
                <RiDownloadLine className="w-5 h-5"/>
            </Button>
            <Button isIconOnly color="primary" size="md" title="Share to Twitter" aria-label="Share to Twitter" onPress={handleShareToTwitter}>
                <RiTwitterXLine className="w-5 h-5"/>
            </Button>
            <Button isIconOnly color="primary" size="md" title="Share to Facebook" aria-label="Share to Facebook" onPress={handleShareToFacebook}>
                <RiFacebookFill className="w-5 h-5"/>
            </Button>
            <Button isIconOnly color="primary" size="md" title="Share to Reddit" aria-label="Share to Reddit" onPress={handleShareToReddit}>
                <RiRedditLine className="w-5 h-5"/>
            </Button>
        </div>
    )
}