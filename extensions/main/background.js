'use strict';

const CACHE_NAME = "cache-v1";

const overwriteScriptText = (text) => {
    return "// comment added - meugur \n" + text;
};

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {   
        const request = new Request(
            message.src, 
            {
                cache: 'no-cache',
                method: 'GET',
            }
        );
        window.caches.match(message.src).then((response) => {
            if (response === undefined) {
                let responseObj = null;
                let instrumentedScript = '';
                return fetch(request).then((response) => {
                    responseObj = response;
                    return response.blob();
                }).then((blob) => {
                    return blob.text();
                }).then((text) => {
                    instrumentedScript = overwriteScriptText(text);
                    return window.caches.open(CACHE_NAME);
                }).then((cache) => {
                    let newResponse = new Response(
                        new Blob([instrumentedScript], {"type": "text/javascript"}),
                        {
                            "status": responseObj.status,
                            "statusText": responseObj.statusText,
                            "headers": responseObj.headers,
                        }
                    );
                    return cache.put(request, newResponse)
                }).then(() => {
                    sendResponse({text: instrumentedScript});
                }).catch((e) => console.log(e));
            }
            return response.blob().then((blob) => {
                return blob.text();
            }).then((text) => {
                sendResponse({text: text});
            }).catch((e) => console.log(e));
        })
        return true;
    }
);

const requestHandler = (details) => {
    // console.log("received script " + details.url);
    return {'cancel': false};
};

chrome.webRequest.onBeforeRequest.addListener(
    requestHandler,
    {
        urls: ['*://*/*'], 
        types: ['script']
    },
    ['blocking'],
);
