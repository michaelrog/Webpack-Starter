SITE.toolbars = function() {

    const t = {};

    t.headerActive = true;
    t.actionBarActive = false;
    t.headerThreshold = 75;
    let inlineFormEl = document.getElementById('actionBarThreshold');
    t.actionBarOffset = inlineFormEl ? inlineFormEl.offsetTop : 0;

    t.siteHeaderEls = document.querySelectorAll('.siteHeader');
    t.actionBarEls = document.querySelectorAll('.actionsToolbar');

    let visibleClass = 'toolbar__in';
    let hiddenClass = 'toolbar__out';

    t.processScroll = function(info) {

        //log(info);

        if (info.y > t.headerThreshold && info.dir == 'down') {
            t.hideEls(t.siteHeaderEls);
        }
        else
        {
            t.showEls(t.siteHeaderEls);
        }

        if (info.y > t.headerThreshold && info.yBottom < t.actionBarOffset) {
            t.showEls(t.actionBarEls);
        }
        else
        {
            t.hideEls(t.actionBarEls);
        }

    };

    t.showEls = function(els){
        els.forEach((el) => {
            el.classList.add(visibleClass);
            el.classList.remove(hiddenClass);
        });
    };

    t.hideEls = function(els){
        els.forEach((el) => {
            el.classList.add(hiddenClass);
            el.classList.remove(visibleClass);
        });
    };

    return t;

}();


// Init via scrollWatcher

SITE.scrollWatcher.init({
    onTick: SITE.toolbars.processScroll,
    onChange: SITE.toolbars.processScroll,
});
