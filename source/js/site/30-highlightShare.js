import highlightShare from 'highlight-share';

import * as twitterSharer from 'highlight-share/dist/sharers/twitter';
import * as facebookSharer from 'highlight-share/dist/sharers/facebook';
import * as emailSharer from 'highlight-share/dist/sharers/email';
import * as copySharer from 'highlight-share/dist/sharers/copy';

const selectionShare = highlightShare({
    selector: '.js_sharable',
    sharers: [twitterSharer, facebookSharer, emailSharer, copySharer]
    // sharers: [twitterSharer, facebookSharer, emailSharer, linkedInSharer, messengerShare, copySharer]
});

SITE.selectionShare = selectionShare;
SITE.selectionShare.init();
