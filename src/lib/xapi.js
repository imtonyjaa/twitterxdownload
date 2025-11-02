/**
 * Constructor
 * @param {Object} opts consumer key and secret
 */
function OAuth(opts) {
    if(!(this instanceof OAuth)) {
        return new OAuth(opts);
    }

    if(!opts) {
        opts = {};
    }

    if(!opts.consumer) {
        throw new Error('consumer option is required');
    }

    this.consumer            = opts.consumer;
    this.nonce_length        = opts.nonce_length || 32;
    this.version             = opts.version || '1.0';
    this.parameter_seperator = opts.parameter_seperator || ', ';
    this.realm               = opts.realm;

    if(typeof opts.last_ampersand === 'undefined') {
        this.last_ampersand = true;
    } else {
        this.last_ampersand = opts.last_ampersand;
    }

    // default signature_method is 'PLAINTEXT'
    this.signature_method = opts.signature_method || 'PLAINTEXT';

    if(this.signature_method == 'PLAINTEXT' && !opts.hash_function) {
        opts.hash_function = function(base_string, key) {
            return key;
        }
    }

    if(!opts.hash_function) {
        throw new Error('hash_function option is required');
    }

    this.hash_function = opts.hash_function;
    this.body_hash_function = opts.body_hash_function || this.hash_function;
}

/**
 * OAuth request authorize
 * @param  {Object} request data
 * {
 *     method,
 *     url,
 *     data
 * }
 * @param  {Object} key and secret token
 * @return {Object} OAuth Authorized data
 */
OAuth.prototype.authorize = function(request, token) {
    var oauth_data = {
        oauth_consumer_key: this.consumer.key,
        oauth_nonce: this.getNonce(),
        oauth_signature_method: this.signature_method,
        oauth_timestamp: this.getTimeStamp(),
        oauth_version: this.version
    };

    if(!token) {
        token = {};
    }

    if(token.key !== undefined) {
        oauth_data.oauth_token = token.key;
    }

    if(!request.data) {
        request.data = {};
    }

    if(request.includeBodyHash) {
      oauth_data.oauth_body_hash = this.getBodyHash(request, token.secret)
    }

    oauth_data.oauth_signature = this.getSignature(request, token.secret, oauth_data);

    return oauth_data;
};

/**
 * Create a OAuth Signature
 * @param  {Object} request data
 * @param  {Object} token_secret key and secret token
 * @param  {Object} oauth_data   OAuth data
 * @return {String} Signature
 */
OAuth.prototype.getSignature = function(request, token_secret, oauth_data) {
    return this.hash_function(this.getBaseString(request, oauth_data), this.getSigningKey(token_secret));
};

/**
 * Create a OAuth Body Hash
 * @param {Object} request data
 */
OAuth.prototype.getBodyHash = function(request, token_secret) {
  var body = typeof request.data === 'string' ? request.data : JSON.stringify(request.data)

  if (!this.body_hash_function) {
    throw new Error('body_hash_function option is required');
  }

  return this.body_hash_function(body, this.getSigningKey(token_secret))
};

/**
 * Base String = Method + Base Url + ParameterString
 * @param  {Object} request data
 * @param  {Object} OAuth data
 * @return {String} Base String
 */
OAuth.prototype.getBaseString = function(request, oauth_data) {
    return request.method.toUpperCase() + '&' + this.percentEncode(this.getBaseUrl(request.url)) + '&' + this.percentEncode(this.getParameterString(request, oauth_data));
};

/**
 * Get data from url
 * -> merge with oauth data
 * -> percent encode key & value
 * -> sort
 *
 * @param  {Object} request data
 * @param  {Object} OAuth data
 * @return {Object} Parameter string data
 */
OAuth.prototype.getParameterString = function(request, oauth_data) {
    var base_string_data;
    if (oauth_data.oauth_body_hash) {
        base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.deParamUrl(request.url))));
    } else {
        base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.mergeObject(request.data, this.deParamUrl(request.url)))));
    }

    var data_str = '';

    //base_string_data to string
    for(var i = 0; i < base_string_data.length; i++) {
        var key = base_string_data[i].key;
        var value = base_string_data[i].value;
        // check if the value is an array
        // this means that this key has multiple values
        if (value && Array.isArray(value)){
          // sort the array first
          value.sort();

          var valString = "";
          // serialize all values for this key: e.g. formkey=formvalue1&formkey=formvalue2
          value.forEach((function(item, i){
            valString += key + '=' + item;
            if (i < value.length){
              valString += "&";
            }
          }).bind(this));
          data_str += valString;
        } else {
          data_str += key + '=' + value + '&';
        }
    }

    //remove the last character
    data_str = data_str.substr(0, data_str.length - 1);
    return data_str;
};

/**
 * Create a Signing Key
 * @param  {String} token_secret Secret Token
 * @return {String} Signing Key
 */
OAuth.prototype.getSigningKey = function(token_secret) {
    token_secret = token_secret || '';

    if(!this.last_ampersand && !token_secret) {
        return this.percentEncode(this.consumer.secret);
    }

    return this.percentEncode(this.consumer.secret) + '&' + this.percentEncode(token_secret);
};

/**
 * Get base url
 * @param  {String} url
 * @return {String}
 */
OAuth.prototype.getBaseUrl = function(url) {
    return url.split('?')[0];
};

/**
 * Get data from String
 * @param  {String} string
 * @return {Object}
 */
OAuth.prototype.deParam = function(string) {
    var arr = string.split('&');
    var data = {};

    for(var i = 0; i < arr.length; i++) {
        var item = arr[i].split('=');

        // '' value
        item[1] = item[1] || '';

        // check if the key already exists
        // this can occur if the QS part of the url contains duplicate keys like this: ?formkey=formvalue1&formkey=formvalue2
        if (data[item[0]]){
          // the key exists already
          if (!Array.isArray(data[item[0]])) {
            // replace the value with an array containing the already present value
            data[item[0]] = [data[item[0]]];
          }
          // and add the new found value to it
          data[item[0]].push(decodeURIComponent(item[1]));
        } else {
          // it doesn't exist, just put the found value in the data object
          data[item[0]] = decodeURIComponent(item[1]);
        }
    }

    return data;
};

/**
 * Get data from url
 * @param  {String} url
 * @return {Object}
 */
OAuth.prototype.deParamUrl = function(url) {
    var tmp = url.split('?');

    if (tmp.length === 1)
        return {};

    return this.deParam(tmp[1]);
};

/**
 * Percent Encode
 * @param  {String} str
 * @return {String} percent encoded string
 */
OAuth.prototype.percentEncode = function(str) {
    return encodeURIComponent(str)
        .replace(/\!/g, "%21")
        .replace(/\*/g, "%2A")
        .replace(/\'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
};

/**
 * Percent Encode Object
 * @param  {Object} data
 * @return {Object} percent encoded data
 */
OAuth.prototype.percentEncodeData = function(data) {
    var result = {};

    for(var key in data) {
        var value = data[key];
        // check if the value is an array
        if (value && Array.isArray(value)){
          var newValue = [];
          // percentEncode every value
          value.forEach((function(val){
            newValue.push(this.percentEncode(val));
          }).bind(this));
          value = newValue;
        } else {
          value = this.percentEncode(value);
        }
        result[this.percentEncode(key)] = value;
    }

    return result;
};

/**
 * Get OAuth data as Header
 * @param  {Object} oauth_data
 * @return {String} Header data key - value
 */
OAuth.prototype.toHeader = function(oauth_data) {
    var sorted = this.sortObject(oauth_data);

    var header_value = 'OAuth ';

    if (this.realm) {
        header_value += 'realm="' + this.realm + '"' + this.parameter_seperator;
    }

    for(var i = 0; i < sorted.length; i++) {
        if (sorted[i].key.indexOf('oauth_') !== 0)
            continue;

        header_value += this.percentEncode(sorted[i].key) + '="' + this.percentEncode(sorted[i].value) + '"' + this.parameter_seperator;
    }

    return {
        Authorization: header_value.substr(0, header_value.length - this.parameter_seperator.length) //cut the last chars
    };
};

/**
 * Create a random word characters string with input length
 * @return {String} a random word characters string
 */
OAuth.prototype.getNonce = function() {
    var word_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';

    for(var i = 0; i < this.nonce_length; i++) {
        result += word_characters[parseInt(Math.random() * word_characters.length, 10)];
    }

    return result;
};

/**
 * Get Current Unix TimeStamp
 * @return {Int} current unix timestamp
 */
OAuth.prototype.getTimeStamp = function() {
    return parseInt(new Date().getTime()/1000, 10);
};

////////////////////// HELPER FUNCTIONS //////////////////////

/**
 * Merge object
 * @param  {Object} obj1
 * @param  {Object} obj2
 * @return {Object}
 */
OAuth.prototype.mergeObject = function(obj1, obj2) {
    obj1 = obj1 || {};
    obj2 = obj2 || {};

    var merged_obj = obj1;
    for(var key in obj2) {
        merged_obj[key] = obj2[key];
    }
    return merged_obj;
};

/**
 * Sort object by key
 * @param  {Object} data
 * @return {Array} sorted array
 */
OAuth.prototype.sortObject = function(data) {
    var keys = Object.keys(data);
    var result = [];

    keys.sort();

    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        result.push({
            key: key,
            value: data[key],
        });
    }

    return result;
};

import CryptoJS from 'crypto-js';

class XAPI {
    constructor(consumerApiKey, consumerApiKeySecret, accessToken, accessTokenSecret) {
        this.debug = false; // if debug = true, so it doesn't send finally data to Twitter Api
        this.uploadMediaDebug = false; // if uploadMediaDebug = true, so it doesn't upload media to Twitter Api

        this.consumerApiKey = consumerApiKey;
        this.consumerApiKeySecret = consumerApiKeySecret;
        this.accessToken = accessToken;
        this.accessTokenSecret = accessTokenSecret;

        if (!consumerApiKey || !consumerApiKeySecret || !accessToken || !accessTokenSecret) {
            throw new Error("you have to set consumerApiKey, consumerApiKeySecret, accessToken, accessTokenSecret");
        }

        // create OAuth
        this.oauth = new OAuth({
            consumer: { key: this.consumerApiKey, secret: this.consumerApiKeySecret },
            signature_method: 'HMAC-SHA1',
            hash_function: (base_string, key) => {
                return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
            },
        });
    }

    // get every twitter api need;
    _getAuthHeader(url, method, data = {}) {
        const request_data = { 
            url, 
            method,
            data: data || {}
        };
        const token = { key: this.accessToken, secret: this.accessTokenSecret };
        
        const oauth = this.oauth.authorize(request_data, token);
        return this.oauth.toHeader(oauth);
    }

    // when add video to tweet must waiting media processing;
    async _waitForMediaProcessing(mediaId) {
        const url = `/api/x/mediaupload?command=STATUS&media_id=${mediaId}`;
        let processingInfo;
        do {
            const response = await fetch(url, {
                method: 'GET',
                headers: this._getAuthHeader(`https://upload.twitter.com/1.1/media/upload.json?command=STATUS&media_id=${mediaId}`, 'GET')
            });
            const data = await response.json();
            processingInfo = data.processing_info;
            if (processingInfo?.state === 'failed') {
                throw new Error(`Media processing failed: ${processingInfo.error.message}`);
            }
            if (processingInfo?.state !== 'succeeded') {
                await new Promise(resolve => setTimeout(resolve, (processingInfo?.check_after_secs || 5) * 1000));
            }
        } while (processingInfo && processingInfo.state !== 'succeeded');
    }

    async _fetchMediaFromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch media from URL: ${response.status} ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            const blob = await response.blob();
            
            const fileName = url.split('/').pop() || 'media';
            return new File([blob], fileName, { type: contentType });
        } catch (error) {
            throw error;
        }
    }

    async uploadMedia(mediaSource) {
        const url = '/api/x/mediaupload';
                
        let mediaFile;
        if (typeof mediaSource === 'string') {
            if (mediaSource.startsWith('http://') || mediaSource.startsWith('https://')) {
                mediaFile = await this._fetchMediaFromUrl(mediaSource);
            } else if (mediaSource.startsWith('data:')) {
                const matches = mediaSource.match(/^data:([^;]+);base64,(.+)$/);
                if (!matches) {
                    throw new Error('Invalid base64 data format');
                }
                
                const contentType = matches[1];
                const base64Data = matches[2];
                const binaryData = atob(base64Data);
                const byteArray = new Uint8Array(binaryData.length);
                
                for (let i = 0; i < binaryData.length; i++) {
                    byteArray[i] = binaryData.charCodeAt(i);
                }
                
                const extension = contentType.split('/')[1] || 'jpg';
                mediaFile = new File([byteArray], `media.${extension}`, { type: contentType });
            } else if (/^\d+$/.test(mediaSource.trim())) {
                return mediaSource.trim();
            } else {
                throw new Error('Invalid media source format');
            }
        } else if (mediaSource instanceof File || mediaSource instanceof Blob) {
            mediaFile = mediaSource instanceof File ? mediaSource : new File([mediaSource], 'media', { type: mediaSource.type });
        } else {
            throw new Error('Invalid media source. Must be a URL string, base64 data, or File/Blob object.');
        }
        
        const mediaType = mediaFile.type === 'video/mp4' ? 'video/mp4' : 'image/jpeg';

        let mediaId;
        if (!this.uploadMediaDebug) {
            if (mediaType === 'image/jpeg') {
                const form = new FormData();
                form.append('media', mediaFile);

                const response = await fetch(url, {
                    method: 'POST',
                    body: form,
                    headers: this._getAuthHeader('https://upload.twitter.com/1.1/media/upload.json', 'POST')
                });
                const responseData = await response.json();
                mediaId = responseData.media_id_string;
            } else {
                // INIT
                const initParams = {
                    command: 'INIT',
                    total_bytes: mediaFile.size.toString(),
                    media_type: mediaType
                };

                const initBody = new URLSearchParams(initParams).toString();

                const authHeader = this._getAuthHeader('https://upload.twitter.com/1.1/media/upload.json', 'POST');

                const initResponse = await fetch(url, {
                    method: 'POST',
                    body: initBody,
                    headers: {
                        ...authHeader,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                });
                const initData = await initResponse.json();

                if(initData.errors && initData.errors.length > 0) {
                    throw new Error(initData.errors[0].message);
                }

                mediaId = initData.media_id_string;

                // APPEND
                const chunkSize = 5 * 1024 * 1024; // 5MB chunks
                const totalChunks = Math.ceil(mediaFile.size / chunkSize);
                
                for (let i = 0; i < totalChunks; i++) {
                    const start = i * chunkSize;
                    const end = Math.min(start + chunkSize, mediaFile.size);
                    const chunk = mediaFile.slice(start, end);
                    
                    const appendForm = new FormData();
                    appendForm.append('command', 'APPEND');
                    appendForm.append('media_id', mediaId);
                    appendForm.append('segment_index', i);
                    appendForm.append('media', chunk);

                    await fetch(url, {
                        method: 'POST',
                        body: appendForm,
                        headers: this._getAuthHeader('https://upload.twitter.com/1.1/media/upload.json', 'POST')
                    });
                }

                // FINALIZE
                const finalizeParams = {
                    command: 'FINALIZE',
                    media_id: mediaId
                };

                const finalizeBody = new URLSearchParams(finalizeParams).toString();
                const finalizeResponse = await fetch(url, {
                    method: 'POST',
                    body: finalizeBody,
                    headers: {
                        ...this._getAuthHeader('https://upload.twitter.com/1.1/media/upload.json', 'POST'),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                });
                const finalizeData = await finalizeResponse.json();

                if (finalizeData.processing_info) {
                    await this._waitForMediaProcessing(mediaId);
                }
            }
        } else {
            mediaId = 'debug_media_id';
        }

        return mediaId;
    }

    // create a tweet sender;
    createTweet(text = "") {
        let data = {
            text
        };

        return {
            data,
            // set tweet text content
            setText(text = "") {
                data.text = text;
                return this;
            },
            setReplyTo(tweetId = "") {
                data.reply = {
                    in_reply_to_tweet_id: tweetId
                };
                return this;
            },
            // add Image or Video to tweet sender
            addMedia: async (mediaSource) => {
                const mediaId = await this.uploadMedia(mediaSource);
                if (!data.media) data.media = { media_ids: [] };
                data.media.media_ids.unshift(mediaId);
                return this;
            },
            // post data to twitter api
            send: async () => {
                const url = '/api/x/tweet';
                const options = {
                    method: 'POST',
                    headers: {
                        ...this._getAuthHeader('https://api.twitter.com/2/tweets', 'POST'),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                };
                
                if (this.debug) {
                    console.log(data);
                    return { data: { id: 'debug_tweet_id' } };
                }

                try {
                    const response = await fetch(url, options);
                    const responseData = await response.json();
                    
                    return responseData;
                } catch (error) {
                    throw error;
                }
            }
        };
    }
}

export default XAPI;