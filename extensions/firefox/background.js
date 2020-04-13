'use strict';

browser.storage.local.clear();

const CACHING_ENABLED = true;

const overwriteScriptText = (text) => {
    return `/* comment added - meugur */\n${text}`;
};

const requestHandler = (details) => {
    let filter = browser.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();
    let url = details.url;
    let data = '';

    filter.ondata = event => {
        let str = decoder.decode(event.data, {stream: true});
        data += str;
    }
    const onGet = (item) => {
        if (Object.keys(item).length === 0 && item.constructor === Object) {
            let script = {};
            script[url] = overwriteScriptText(data);
    
            const onSet = () => {
                filter.write(encoder.encode(script[url]));
                filter.close();
            };
            const onSetError = (error) => {
                console.log(`Set error: ${error}`);
            };
            browser.storage.local.set(script).then(onSet, onSetError);
        } else {
            filter.write(encoder.encode(item[url]));
            filter.close();
        }
    };
    const onGetError = (error) => {
        console.log(`Get error: ${error}`);
    };
    filter.onstop = event => {
        if (CACHING_ENABLED) {
            browser.storage.local.get(url).then(onGet, onGetError);
        } else {
            filter.write(encoder.encode(overwriteScriptText(data)));
            filter.close();
        }
    };
    return {};
};
  
browser.webRequest.onBeforeRequest.addListener(
    requestHandler,
    {
        urls: ['*://*/*'], 
        types: ['script']
    },
    ['blocking'],
);
