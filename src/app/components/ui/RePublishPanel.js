'use client';
import { Input, Button } from '@heroui/react';
import { getTranslation } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import XAPI from '@/lib/xapi';
import { RiEyeLine, RiEyeOffLine } from '@remixicon/react';

export default function RePublishPanel({ locale ='en',tweets,onClose }) {
    const t = function (key) {
        return getTranslation(locale, key);
    }

    const [isLoading, setIsLoading] = useState(false);
    const [publishNotice, setPublishNotice] = useState('');

    const twitterApiConfig = JSON.parse(localStorage.getItem('twitterApiConfig') || JSON.stringify({
        consumerApiKey: '',
        consumerApiKeySecret: '',
        accessToken: '',
        accessTokenSecret: ''
    }));

    const [consumerApiKey, setConsumerApiKey] = useState(twitterApiConfig.consumerApiKey);
    const [consumerApiKeySecret, setConsumerApiKeySecret] = useState(twitterApiConfig.consumerApiKeySecret);
    const [accessToken, setAccessToken] = useState(twitterApiConfig.accessToken);
    const [accessTokenSecret, setAccessTokenSecret] = useState(twitterApiConfig.accessTokenSecret);
    const [consumerApiKeyHidden, setConsumerApiKeyHidden] = useState(true);
    const [consumerApiKeySecretHidden, setConsumerApiKeySecretHidden] = useState(true);
    const [accessTokenHidden, setAccessTokenHidden] = useState(true);
    const [accessTokenSecretHidden, setAccessTokenSecretHidden] = useState(true);

    const updateConfig = (key, value) => {
        const config = JSON.parse(localStorage.getItem('twitterApiConfig') || '{}');
        config[key] = value;
        localStorage.setItem('twitterApiConfig', JSON.stringify(config));
    };

    const showPublishNotice = (notice, color='danger') => {
        setPublishNotice(
            <span className={`text-${color}-500`}>
                {notice}
            </span>
        );
    }

    const rePublishTweets = async() => {

        if(tweets.length === 0){
            showPublishNotice(t('Nothing to publish'));
            return;
        }else if(tweets.length > 17){
            showPublishNotice(t('Will exceed the API limit of 17 tweets every 24 hours'));
            return;
        }else if(consumerApiKey === '' || consumerApiKeySecret === '' || accessToken === '' || accessTokenSecret === ''){
            showPublishNotice(t('Please set your api keys'));
            return;
        }
        setIsLoading(true);

        const xapi = new XAPI(consumerApiKey, consumerApiKeySecret, accessToken, accessTokenSecret);
        let prevTweenId;
        let successCount = 0;
        for(let i = 0; i < tweets.length; i++){
            showPublishNotice(`${i+1}/${tweets.length} ${t('Sending')}`, 'success');
            const tweetObj = tweets[i];
            const aTweet = xapi.createTweet(tweetObj.tweet_text);

            if (prevTweenId) {
                aTweet.setReplyTo(prevTweenId);
            }
            
            for(let j = 0; j < tweetObj.tweet_media.length; j++){
                const mediaSource = tweetObj.tweet_media[j];
                const mediaInfo = tweetObj.medias_info[j];
                
                if(mediaSource.includes('.mp4')){
                    aTweet.setText(tweetObj.tweet_text + `\nhttps://x.com/${mediaInfo.screen_name}/status/${mediaInfo.status_id}/video/1`);
                }else{
                    showPublishNotice(`${i+1}/${tweets.length} ${t('Media')} ${j+1}/${tweetObj.tweet_media.length} ${t('Sending')}`, 'success');
                    await aTweet.addMedia(mediaSource);
                }
            }

            const response = await aTweet.send();

            if(!response.data){
                showPublishNotice(`Error：${response.detail || 'Post Forbidden'}`);
                break;
            }
            successCount++;
            prevTweenId = response.data.id;
        }

        if(successCount === tweets.length){
            showPublishNotice(t('All tweets published successfully'),'success');
        }

        setIsLoading(false);
    }

    useEffect(() => {
        showPublishNotice(t(`You will publish ${tweets.length} tweets`),'success');
    }, [tweets]);

    return (
        <>
            <div className="flex flex-col gap-4">
                <p className="text-sm text-default-500">
                    {t("Re-Publish these tweets to your Twitter account. You can edit tweets before publishing. Also you can try use 'Translate to' to other languages.")}
                </p>
                <p className="text-sm text-default-500">
                    {t('Go to https://developer.x.com to get your API keys. Free plan is Enough, your API keys will only stored in your browser.')}
                </p>
                <div className="flex justify-end">
                    <Button variant="light" size="sm" onPress={() => {
                        // open a file and read the content
                        const file = document.createElement('input');
                        file.type = 'file';
                        file.accept = '.json';
                        file.onchange = (e) => {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const config = JSON.parse(e.target.result);
                                console.log(config);
                                if(config.consumerApiKey && config.consumerApiKeySecret && config.accessToken && config.accessTokenSecret){ 
                                    setConsumerApiKey(config.consumerApiKey);
                                    setConsumerApiKeySecret(config.consumerApiKeySecret);
                                    setAccessToken(config.accessToken);
                                    setAccessTokenSecret(config.accessTokenSecret);
                                    updateConfig('consumerApiKey', config.consumerApiKey);
                                    updateConfig('consumerApiKeySecret', config.consumerApiKeySecret);
                                    updateConfig('accessToken', config.accessToken);
                                    updateConfig('accessTokenSecret', config.accessTokenSecret);
                                }else{
                                    showPublishNotice(t('Invalid API keys'));
                                }
                            }
                            reader.readAsText(file);
                        }
                        document.body.appendChild(file);
                        file.click();
                        document.body.removeChild(file);
                    }}>
                       {t('Import API keys')}
                    </Button>
                    <Button variant="light" size="sm" onPress={() => {
                        // download a file with the content
                        const file = new File([JSON.stringify({
                            consumerApiKey,
                            consumerApiKeySecret,
                            accessToken,
                            accessTokenSecret
                        })], 'twitterApiConfig.json', { type: 'application/json' });
                        const url = URL.createObjectURL(file);
                        const a = document.createElement('a');  
                        a.href = url;
                        a.download = 'twitterApiConfig.json';
                        a.click();
                    }}>
                       {t('Export API keys')}
                    </Button>
                </div>
                <div className="flex flex-col gap-2">
                    <Input
                        isDisabled={isLoading}
                        label="Consumer API Key"
                        type={consumerApiKeyHidden ? 'password' : 'text'}
                        endContent={<Button isIconOnly variant="light" size="sm" onPress={() => setConsumerApiKeyHidden(!consumerApiKeyHidden)}>
                            {consumerApiKeyHidden ? <RiEyeLine /> : <RiEyeOffLine />}
                        </Button>}
                        className="w-full"
                        placeholder=""
                        value={consumerApiKey}
                        onChange={(e) => {
                            setConsumerApiKey(e.target.value);
                            updateConfig('consumerApiKey', e.target.value);
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Input
                        isDisabled={isLoading}
                        label="Consumer API Key Secret"
                        type={consumerApiKeySecretHidden ? 'password' : 'text'}
                        endContent={<Button isIconOnly variant="light" size="sm" onPress={() => setConsumerApiKeySecretHidden(!consumerApiKeySecretHidden)}>
                            {consumerApiKeySecretHidden ? <RiEyeLine /> : <RiEyeOffLine />}
                        </Button>}
                        className="w-full"
                        placeholder=""
                        value={consumerApiKeySecret}
                        onChange={(e) => {
                            setConsumerApiKeySecret(e.target.value);
                            updateConfig('consumerApiKeySecret', e.target.value);
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Input
                        isDisabled={isLoading}
                        label="Access Token"
                        type={accessTokenHidden ? 'password' : 'text'}
                        endContent={<Button isIconOnly variant="light" size="sm" onPress={() => setAccessTokenHidden(!accessTokenHidden)}>
                            {accessTokenHidden ? <RiEyeLine /> : <RiEyeOffLine />}
                        </Button>}
                        className="w-full"
                        placeholder=""
                        value={accessToken}
                        onChange={(e) => {
                            setAccessToken(e.target.value);
                            updateConfig('accessToken', e.target.value);
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Input
                        isDisabled={isLoading}
                        label="Access Token Secret"
                        type={accessTokenSecretHidden ? 'password' : 'text'}
                        endContent={<Button isIconOnly variant="light" size="sm" onPress={() => setAccessTokenSecretHidden(!accessTokenSecretHidden)}>
                            {accessTokenSecretHidden ? <RiEyeLine /> : <RiEyeOffLine />}
                        </Button>}
                        className="w-full"
                        placeholder=""
                        value={accessTokenSecret}
                        onChange={(e) => {
                            setAccessTokenSecret(e.target.value);
                            updateConfig('accessTokenSecret', e.target.value);
                        }}
                    />
                </div>
                <div className="h-20 w-full whitespace-pre-wrap break-all">
                {publishNotice}
                </div>
                <Button
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    color="primary"
                    className="w-full"
                    size="lg"
                    radius="full"
                    onPress={rePublishTweets}
                >
                    {t('Re-Publish')}
                </Button>
                <Button
                    isDisabled={isLoading}
                    color="default"
                    className="w-full mt-2"
                    size="lg"
                    radius="full"
                    onPress={()=>{
                        if(onClose)onClose();
                    }}
                >
                    {t('Exit')}
                </Button>
            </div>
        </>
    )
}