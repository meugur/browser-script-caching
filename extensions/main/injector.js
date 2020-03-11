'use strict';

const EXTENSION_ID = 'honlahhbhobbakjcjdnkaloalofnpaje';

const CACHING_ENABLED = false;
const overwriteScriptText = (text) => {
    return "// comment added - meugur \nconsole.log('script rewritten');" + text;
};

const main = () => {
    const SCRIPTS = {};
    const CACHING_ENABLED = false;
    const PROCESSED_SCRIPT_ATTR = 'meugur';
    const overwriteScriptText = (text) => {
        return "// comment added - meugur \nconsole.log('script rewritten');" + text;
    };

    // git://github.com/darkskyapp/string-hash.git
    // The Dark Sky Company
    // devsupport@darkskyapp.com
    const stringHash = (str) => {
        var hash = 5381, i = str.length
        while(i)
        hash = (hash * 33) ^ str.charCodeAt(--i)
        return hash >= 0 ? hash : (hash & 0x7FFFFFFF) + 0x80000000
    };
    //
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    //
    const makeid = (length) => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }

    const fetchScriptTextFromCache = (hashableString) => {
        let hash = stringHash(hashableString);
        let newText = sessionStorage.getItem(hash);
        if (newText === null) {
            try {
                newText = overwriteScriptText(scriptText);
                sessionStorage.setItem(hash, newText);
            } catch (e) {
                // console.log("Session storage over quota")
            }
        }
        return newText;
    };

    const handleInlineScript = (script) => {
        // console.log('process inline sync script: ', script);

        if (CACHING_ENABLED) {
            let scriptText = script.text || script.innerText;
            let newText = fetchScriptTextFromCache(scriptText);
            if (newText) {
                if (script.text) {
                    script.text = newText;
                } else if (script.innerText) {
                    script.innerText = newText;
                }
                return script;
            }
        }
        if (script.text) {
            script.text = overwriteScriptText(script.text);
        } else if (script.innerText) {
            script.innerText = overwriteScriptText(script.innerText);
        }
        return script;
    };

    const handleExternalSyncScript = (script) => {
        // console.log('process external sync script: ', script);

        if (CACHING_ENABLED) {
            let newText = fetchScriptTextFromCache(script.src);
            if (newText) {
                if (!script.defer) {
                    script.src = null;
                    script.removeAttribute('src');
                }
                script.text = newText;

                let loadEvent = new Event('load');
                loadEvent.target = script;
                loadEvent.srcElement = script;
                script.dispatchEvent(loadEvent);
                return script;
            }
        }
        const xhr = new XMLHttpRequest();
        xhr.onload = (e) => {
            if (xhr.status != 200) return;

            // Removing src attribute on defer scripts prevents defer functionality
            if (!script.defer) {
                script.src = null;
                script.removeAttribute('src');
            }
            script.text = overwriteScriptText(xhr.responseText);

            let loadEvent = new Event('load');
            loadEvent.target = script;
            loadEvent.srcElement = script;
            script.dispatchEvent(loadEvent);
        };
        xhr.open('GET', script.src, false);
        try {
            xhr.send();
        } catch (e) {
            console.log('unable to fetch ' + script.src);
        }
        return script;
    };

    const handleExternalAsyncScript = (script) => {
        //console.log('process external async script: ', script);
        let newScript = document.createElement('script');
        newScript[PROCESSED_SCRIPT_ATTR] = true;

        if (!CACHING_ENABLED) {
            const xhr = new XMLHttpRequest();
            // xhr.onerror = (e) => {
            //     newScript.parentNode.replaceChild(script, newScript);
            // };
            xhr.onload = (e) => {
                if (xhr.status != 200) return;
                script.src = null;
                script.removeAttribute('src');
                script.text = overwriteScriptText(xhr.responseText);

                // Replace 'dummy' script after instrumentation
                newScript.parentNode.replaceChild(script, newScript);

                let loadEvent = new Event('load');
                loadEvent.target = script;
                loadEvent.srcElement = script;
                script.dispatchEvent(loadEvent);
            };
            xhr.open('GET', script.src, true);
            try {
                xhr.send();
            } catch (e) {
                console.log('unable to fetch ' + script.src);
            }
        } else {
            newScript.id = makeid(32);
            SCRIPTS[newScript.id] = script;
            window.postMessage(
                {
                    replacementId: newScript.id,
                    type: "ASYNC_CACHE_FROM_PAGE",
                    src: script.src,
                },
                "*",
            );
        }
        return newScript;
    };

    const processScript = (script, async) => {
        // Ensure a script does not get processed more than once
        script[PROCESSED_SCRIPT_ATTR] = true;

        // Only process supported script types
        if (script.type !== '' &&
            script.type !== 'text/javascript'&&
            script.type !== 'application/javascript') {
            console.log('script not supported: ', script.type);
            return script;
        }
        // Sync external script
        if (script.src && script.src.length) {
            if (async) return handleExternalAsyncScript(script);
            return handleExternalSyncScript(script);
        }
        // Inline Script
        if (script.text || script.innerText) {
            return handleInlineScript(script);
        }
        return script;
    };

    const Node = window.Node;
    const HTMLScriptElement = window.HTMLScriptElement;
    const oldAppendChild = Node.prototype.appendChild;
    const oldInsertBefore = Node.prototype.insertBefore;
    const oldReplaceChild = Node.prototype.replaceChild;

    // Overload functions that dynamically add scripts
    Node.prototype.appendChild = function appendChild(newChild) {
        if (newChild instanceof HTMLScriptElement && !newChild[PROCESSED_SCRIPT_ATTR]) {
            // console.log('appendChild of a new script (src: ' + newChild.src + ')');
            return oldAppendChild.call(this, processScript(newChild, true));
        }
        return oldAppendChild.apply(this, arguments);
    }
    Node.prototype.insertBefore = function insertBefore(newChild, refChild) {
        if (newChild instanceof HTMLScriptElement && !newChild[PROCESSED_SCRIPT_ATTR]) {
            // console.log('insertBefore of a new script (src: ' + newChild.src + ')');
            return oldInsertBefore.call(this, processScript(newChild, true), refChild);
        }
        return oldInsertBefore.apply(this, arguments);
    }
    Node.prototype.replaceChild = function replaceChild(newChild, oldChild) {
        if (newChild instanceof HTMLScriptElement && !newChild[PROCESSED_SCRIPT_ATTR]) {
            // console.log('replaceChild of a new script (src: ' + newChild.src + ')');
            return oldReplaceChild.call(this, processScript(newChild, true), oldChild);
        }
        return oldReplaceChild.apply(this, arguments);
    }

    window.addEventListener("message", (e) => {
        if (e.source != window) return;
        if (e.data.type && (e.data.type == "ASYNC_CACHE_FROM_SCRIPT") && CACHING_ENABLED) {
            let replacementScript = document.getElementById(e.data.replacementId);
            let script = SCRIPTS[e.data.replacementId];
            script.text = e.data.text;

            // Replace 'dummy' script after instrumentation
            replacementScript.parentNode.replaceChild(script, replacementScript);

            delete SCRIPTS[e.data.replacementId];
        }
    });
    // Listen for static scripts
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const n of m.addedNodes) {
                if (n instanceof HTMLScriptElement &&
                    !n[PROCESSED_SCRIPT_ATTR] &&
                    !n.getAttribute(PROCESSED_SCRIPT_ATTR)) {
                    n.parentNode.replaceChild(processScript(n, n.async), n);
                }
            }
        }
    });
    observer.observe(window.document.documentElement, {
        childList: true,
        subtree: true,
    });

    // Stop listening when DOM is finished loading 
    window.document.addEventListener('DOMContentLoaded', () => {
        observer.disconnect();
    }, false);
};

// Injects a function onto the page
const injectFunction = (fun) => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = '(' + String(fun) + ')();';

    let target = document.documentElement || document.head || document.body;
    if (target) {
        if (target.firstElementChild) {
            target.insertBefore(script, target.firstElementChild);
        } else {
            target.appendChild(script);
        }
        script.parentNode.removeChild(script);
    }
};

if (window === window.top) {
    injectFunction(main);

    // Handles async caching through the extension
    window.addEventListener("message", (e) => {
        if (e.source != window) return;
        if (e.data.type && (e.data.type == "ASYNC_CACHE_FROM_PAGE") && CACHING_ENABLED) {
            chrome.runtime.sendMessage(
                EXTENSION_ID,
                {src: e.data.src},
                (response) => {
                    window.postMessage(
                        {
                            type: "ASYNC_CACHE_FROM_SCRIPT",
                            text: response.text,
                            replacementId: e.data.replacementId,
                        },
                        "*",
                    );
                }
            );
        }
    });
}