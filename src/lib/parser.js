
function parseFullText(fullText,tweet) {
    const urlRegex = /(https?:\/\/[a-zA-Z0-9_\-\.]+(?:\/[^\s]*)?(?:https?:\/\/[^\s]*)?)/g;
    const tcoLinks = fullText.match(urlRegex) || [];

    if (tcoLinks.length > 0 && tweet.note_tweet?.note_tweet_results?.result?.entity_set?.urls) {
        for (let i = 0; i < tcoLinks.length; i++) {
            const tcoLink = tcoLinks[i];
            const urlEntity = tweet.note_tweet?.note_tweet_results?.result?.entity_set?.urls.find(url => url.url === tcoLink);
            
            if (urlEntity) {
                fullText = fullText.replace(tcoLink, `${urlEntity.expanded_url}`);
            } else {
                fullText = fullText.replace(tcoLink, '');
            }
        }
    }

    fullText = fullText.replace(urlRegex, '');

    fullText = fullText.replace(/&amp;/g, '&');
    return fullText;
}
function parseTweetData(oriData) {
    try {
        let entries;
        for (const instruction of oriData.data.threaded_conversation_with_injections_v2.instructions) {
            if (instruction.entries) {
                entries = instruction.entries;
                break;
            }
        }
        
        const tweets = [];

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            
            if (entry.content?.__typename === "TimelineTimelineItem") {
                if (entry.content.itemContent?.tweet_results?.result) {
                    const tweet = entry.content.itemContent.tweet_results.result;

                    const user = tweet.core?.user_results?.result?.legacy || tweet.tweet?.core?.user_results?.result?.legacy;
                    const screen_name = user.screen_name;
                    
                    let legacy = tweet.legacy || tweet.tweet?.legacy;
                    const tweetId = BigInt(legacy.id_str);
                    
                    let fullText = tweet.note_tweet?.note_tweet_results.result.text || legacy.full_text || '';
                    fullText = parseFullText(fullText,tweet);

                    const tweetData = {
                        id_str: tweetId,
                        text: fullText,
                        medias: []
                    };

                    if (legacy.extended_entities?.media) {
                        for (let j = 0; j < legacy.extended_entities.media.length; j++) {
                            const media = legacy.extended_entities.media[j];
                            if (media.type === 'photo') {
                                tweetData.medias.push({
                                    url: media.media_url_https,
                                    type: 'photo'
                                });
                            } else if (media.type === 'video') {
                                
                                const variants = media.video_info.variants;
                                const mp4Variants = variants.filter(v => v.content_type === 'video/mp4');
                                if (mp4Variants.length > 0) {
                                    
                                    mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                                    tweetData.medias.push({
                                        url: mp4Variants[0].url,
                                        type: 'video',
                                        id_str: media.source_status_id_str || media.id_str,
                                        duration_millis: media.video_info.duration_millis,
                                        status_id: tweetId,
                                        screen_name: media.additional_media_info?.source_user?.user_results?.result?.legacy?.screen_name || screen_name
                                    });
                                }
                            }
                        }
                    }

                    const card = tweet.card || tweet.tweet?.card || null;
                    if(card && card.legacy && card.legacy.binding_values){
                        const value = card.legacy.binding_values[0].value.string_value;
                        const valueJson = JSON.parse(value);
                        const mediaId = valueJson.component_objects.media_1.data.id;
                        const media = valueJson.media_entities[mediaId];
                        const variants = media.video_info.variants;
                        const mp4Variants = variants.filter(v => v.content_type === 'video/mp4');
                        if (mp4Variants.length > 0) {
                            
                            mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                            tweetData.medias.push({
                                url: mp4Variants[0].url,
                                type: 'video',
                                id_str: media.source_status_id_str || media.id_str,
                                duration_millis: media.video_info.duration_millis,
                                status_id: tweetId,
                                screen_name: media.additional_media_info?.source_user?.user_results?.result?.legacy?.screen_name || screen_name
                            });
                        }
                    }

                    tweets.push(tweetData);
                }
            }
            
            else if (entry.content?.__typename === "TimelineTimelineModule") {
                
                if (entry.content.items && Array.isArray(entry.content.items)) {
                    for (let j = 0; j < entry.content.items.length; j++) {
                        const item = entry.content.items[j];
                        
                        
                        if (item.item?.itemContent?.tweet_results?.result) {
                            const tweet = item.item.itemContent.tweet_results.result;
                            
                            const legacy = tweet.legacy || tweet.tweet?.legacy;
                            if(!legacy)continue;
                            const tweetId = BigInt(legacy.id_str);
                            const user = tweet.core?.user_results?.result?.legacy || tweet.tweet?.core?.user_results?.result?.legacy;
                            const screen_name = user.screen_name;
                            
                            
                            const tweetDisplayType = item.item.itemContent.tweetDisplayType;
                            const isThreadTweet = tweetDisplayType === 'SelfThread';
                            
                            
                            if (isThreadTweet) {
                                let fullText = tweet.note_tweet?.note_tweet_results.result.text || tweet.legacy?.full_text || '';
                                fullText = parseFullText(fullText,tweet);

                                const tweetData = {
                                    id_str: tweetId,
                                    text: fullText,
                                    medias: []
                                };

                                if (tweet.legacy?.extended_entities?.media) {
                                    for (let k = 0; k < tweet.legacy.extended_entities.media.length; k++) {
                                        const media = tweet.legacy.extended_entities.media[k];
                                        if (media.type === 'photo') {
                                            tweetData.medias.push({
                                                url: media.media_url_https,
                                                type: 'photo'
                                            });
                                        } else if (media.type === 'video') {
                                            const variants = media.video_info.variants;
                                            const mp4Variants = variants.filter(v => v.content_type === 'video/mp4');
                                            if (mp4Variants.length > 0) {
                                                mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                                                tweetData.medias.push({
                                                    url: mp4Variants[0].url,
                                                    type: 'video',
                                                    id_str: media.source_status_id_str || media.id_str,
                                                    duration_millis: media.video_info.duration_millis,
                                                    status_id: tweetId,
                                                    screen_name: media.additional_media_info?.source_user?.user_results?.result?.legacy?.screen_name || screen_name
                                                });
                                            }
                                        }
                                    }
                                }

                                tweets.push(tweetData);
                            }
                        }
                    }
                }
            }
        }

        console.log('Parsed ' + tweets.length + ' tweets');
        return tweets;
    } catch (error) {
        console.error('Error parsing tweet data:', error);
        
        return [];
    }
}

export { parseTweetData };