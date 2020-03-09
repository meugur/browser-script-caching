"use strict";

const handleNode = async (node, target) => {

    if (node.tagName !== 'SCRIPT') {
        return;
    }

    console.log(node);
    console.log(target);

    return new Promise(resolve => {
        setTimeout(() => {
            alert(0);
            resolve();
        }, 2000);
    });
};

const observer = new MutationObserver(async (mutations) => {
    for (const m of mutations) {
        for (const n of m.addedNodes) {
            await handleNode(n, m.target);
        }
    }
});
observer.observe(document, {
    childList: true,
    subtree: true,
});
