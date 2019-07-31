

let profiles = [

    {
        selector: '[data-cs-watch-self]',
        watch: 'self',
        sizes: [
            {
                minWidth: 80,
                maxWidth: 160,
                class: 'is_w80to160'
            },
            {
                minWidth: 160,
                maxWidth: 300,
                class: 'is_w160to300'
            },
            {
                minWidth: 600,
                class: 'is_bigish'
            }
        ]
    },

    {
        selector: '[data-cs-watch-parent]',
        watch: 'parent',
        sizes: [
            {
                minWidth: 80,
                maxWidth: 160,
                class: 'in_80to160'
            },
            {
                minWidth: 600,
                class: 'in_bigish'
            }
        ]
    },

];

let ContextSizesHelpers = {

    addClass: function addClass(el, className)
    {
        if (el.classList)
            el.classList.add(className);
        else
            el.className += ' ' + className;
    },

    removeClass: function removeClass(el, className)
    {
        if (el.classList)
            el.classList.remove(className);
        else
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    },

};


let ContextSizesResizeHandler = (function ContextSizesResizeHandler()
{

    /*
     * c.f. https://developer.mozilla.org/en-US/docs/Web/Events/resize
     */

    var callbacks = [],
        running = false;

    // fired on resize event
    function resize() {

        if (!running) {
            running = true;

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(runCallbacks);
            } else {
                setTimeout(runCallbacks, 120);
            }
        }

    }

    // Run the actual callbacks
    function runCallbacks() {

        callbacks.forEach(function(callback) {
            callback();
        });

        running = false;
    }

    // Adds callback to loop
    function addCallback(callback) {

        if (callback) {
            callbacks.push(callback);
        }

    }

    return {
        // Public method to add additional callback
        add: function(callback) {
            if (!callbacks.length) {
                window.addEventListener('resize', resize);
            }
            addCallback(callback);
        }
    };

}());



let ContextSizes = (function ContextSizes()
{

    const self = this;
    self.profiles = [];

    self.register = function register(profile)
    {
        if (Array.isArray(profile))
        {
            self.profiles = self.profiles.concat(profile);
        }
        else
        {
            self.profiles.push(profile);
        }
    };

    self.processAll = function processAll()
    {
        self.profiles.forEach(self.processProfile);
    };

    self.processProfile = function processProfile(profile)
    {
        // root, selector, watch, sizes

        let root = profile.root || document;
        let elements = root.querySelectorAll(profile.selector);
        elements.forEach((el) => { self.processElement(el, profile) });

    };

    self.processElement = function processElement(el, profile)
    {

        let width;
        let height;

        if (profile.watch === 'self')
        {
            // Watching self
            width = el.offsetWidth;
            height = el.offsetHeight;
        }
        else
        {
            // Watching parent
            width = el.parentNode.offsetWidth;
            height = el.parentNode.offsetHeight;
        }

        profile.sizes.forEach(function(size){

            if (
                (
                    size.minWidth === undefined || size.minWidth === null
                    || Number(size.minWidth) <= width
                ) && (
                    size.maxWidth === undefined || size.maxWidth === null
                    || Number(size.maxWidth) >= width
                ) && (
                    size.minHeight === undefined || size.minHeight === null
                    || Number(size.maxHeight) <= height
                ) && (
                    size.maxHeight === undefined || size.maxHeight === null
                    || Number(size.maxHeight) >= height
                )
            )
            {
                ContextSizesHelpers.addClass(el, size.class);
            }
            else
            {
                ContextSizesHelpers.removeClass(el, size.class);
            }

        });

    };

    self.init = function init(profile)
    {

        self.register(profile);

        ContextSizesResizeHandler.add(function() {
            self.processAll();
        });

    };

    return self;


}());


ContextSizes.init(profiles);


/*


el.querySelectorAll(selector);
document.querySelectorAll(selector);
ContextSizesHelpers




 */