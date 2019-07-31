import Vue from 'vue';
import algoliasearch from 'algoliasearch/dist/algoliasearchLite';
import algoliasearchHelper from 'algoliasearch-helper/dist/algoliasearch.helper';
import simpleStorage from 'simplestorage.js/simpleStorage';
import accounting from 'accounting/accounting';

//let Flickity = require('flickity');
import Flickity from 'flickity';

/*
 * Helpers
 */

SITE.helpers = {
    scrollPosition: null,
    /**
     * Gets the hash.
     *
     * @returns {string}
     */
    getHash: function() {
        return window.location.hash.substring(1);
    },
    /**
     * Gets the hash params.
     *
     * @returns {{}}
     */
    getHashParams: function () {
        let urlParams = {},
            match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query = SITE.helpers.getHash();

        while (match = search.exec(query)) {
            urlParams[decode(match[1])] = decode(match[2]);
        }

        return urlParams;
    },
    /**
     * Gets a hash variable.
     *
     * @param key
     * @param defaultVal
     * @returns {*|boolean}
     */
    getHashVar : function (key, defaultVal) {
        defaultVal = typeof defaultVal !== 'undefined' ? defaultVal : false;

        let vars = SITE.helpers.getHashParams();
        return vars[key] || defaultVal;
    },
    /**
     * Sets a hash variable.
     *
     * @param key
     * @param val
     */
    setHashVar : function (key, val) {
        let urlParams = SITE.helpers.getHashParams();
        val = val || '';
        val += '';

        let newString = val.length ? key + '=' + encodeURIComponent(val) : '';
        let newHash = '';

        // If the hash contains this variable query already, replace it.
        if (key in urlParams) {
            newHash = location.hash.replace((key + '=' + encodeURIComponent(urlParams[key])), newString)
        }
        // Otherwise, append it.
        else {
            let sym = location.hash.length > 1 ? '&' : '';
            newHash = location.hash + sym + newString;
        }

        // Clean up the new string
        newHash = newHash.replace('#&','').replace('&&','&').replace(/\&$/, "");

        // Set the new hash
        SITE.helpers.changeHashWithoutScroll(newHash);
    },
    /**
     * Array of objects has key value.
     * http://stackoverflow.com/a/8217466/1136822
     *
     * @param array
     * @param key
     * @param value
     * @returns {boolean}
     */
    arrayOfObjectsHasKeyValue: function(array, key, value) {
        for(let i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return array[i];
            }
        }
        return false;
    },
    /**
     * Format number. Uses the accounting.js javascript.
     *
     * @param number
     * @param decimals
     * @param thousandsSeparator
     */
    formatNumber: function(number, decimals, thousandsSeparator) {
        if ( typeof decimals === 'undefined') {
            decimals = 0;
        }
        if ( typeof thousandsSeparator === 'undefined' ) {
            thousandsSeparator = ',';
        }
        return accounting.formatNumber(number, decimals, thousandsSeparator);
    },
    /**
     * Formats a scripture name by removing the "(###) " prefix.
     */
    formatScriptureName: function(scriptureName) {
        if (!scriptureName) {
            return '';
        }
        let regexp = /^\(\d{3}\)\s/g;
        return scriptureName.replace(regexp, '')
    },
    /**
     * Formats a sorted facet key. Removes the trailing underscore.
     *
     * @param facetKey
     */
    formatSortedFacetKey: function(facetKey) {
        let regexp = /_$/g;
        return facetKey.replace(regexp, '')
    },
    /**
     * Sort object by keys.
     * Modified from: http://stackoverflow.com/a/5467142/1136822
     *
     * Note: This appends an underscore to the object keys so that the keys will
     * sort even if they are numeric.
     *
     * @param theObject
     * @param isAsc bool
     * @returns {{}}
     */
    sortObjectByKeys: function sortObjectByKeys(theObject, isAsc = true) {
        let ordered = {};
        let keys = Object.keys(theObject);
        let len = keys.length;
        keys.sort();
        if (!isAsc) {
            keys.reverse()
        }
        for (let i = 0; i < len; i++) {
            let k = keys[i]; //have to add a space in case the key is numeric
            ordered[k+'_'] = theObject[k];
        }
        return ordered;
    },
    /**
     * JavaScript Kebab Case function.
     * based on: https://gist.github.com/tdukart/b87afb278c41245741ae7a0c355a0a0b
     *
     * @param string
     * @returns {string}
     */
    kebabCase: function kebabCase(string) {
        let result = string;

        //replace diacritics
        result = SITE.helpers.replaceDiacritics(result);

        // Convert camelCase capitals to kebab-case.
        result = result.replace(/([a-z][A-Z])/g, function(match) {
            return match.substr(0, 1) + '-' + match.substr(1, 1).toLowerCase();
        });

        // Convert non-camelCase capitals to lowercase.
        result = result.toLowerCase();

        // Convert non-alphanumeric characters to hyphens
        result = result.replace(/[^-a-z0-9]+/g, '-');

        // Remove hyphens from both ends
        result = result.replace(/^-+/, '').replace(/-$/, '');

        return result;
    },
    /**
     * Replace diacritics.
     * based on: http://stackoverflow.com/a/36338365/1136822
     *
     * @param str
     * @returns {string}
     */
    replaceDiacritics: function replaceDiacritics(str){
        let diacritics = [
            {char: 'A', base: /[\300-\306]/g},
            {char: 'a', base: /[\340-\346]/g},
            {char: 'E', base: /[\310-\313]/g},
            {char: 'e', base: /[\350-\353]/g},
            {char: 'I', base: /[\314-\317]/g},
            {char: 'i', base: /[\354-\357]/g},
            {char: 'O', base: /[\322-\330]/g},
            {char: 'o', base: /[\362-\370]/g},
            {char: 'U', base: /[\331-\334]/g},
            {char: 'u', base: /[\371-\374]/g},
            {char: 'N', base: /[\321]/g},
            {char: 'n', base: /[\361]/g},
            {char: 'C', base: /[\307]/g},
            {char: 'c', base: /[\347]/g}
        ];

        diacritics.forEach(function(letter){
            str = str.replace(letter.base, letter.char);
        });

        return str;
    },
    /**
     * Changes the hash without scrolling.
     * @param newHash
     */
    changeHashWithoutScroll: function(newHash){
        SITE.helpers.scrollPosition = $(window).scrollTop();
        //location.hash = newHash;
        SITE.helpers.replaceHash(newHash);
    },
    /**
     * Determine the browser's scrollbar width.
     * @see https://davidwalsh.name/detect-scrollbar-width
     */
    getScrollbarWidth : function() {
        // Create the measurement node
        let scrollDiv = document.createElement("div");
        document.body.appendChild(scrollDiv);
        scrollDiv.setAttribute('style', 'width:100px; height:100px; overflow:scroll; position:absolute; left:-200px;');

        // Get the scrollbar width
        let scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

        // Delete the DIV
        document.body.removeChild(scrollDiv);

        return scrollbarWidth;
    },
    /**
     * Determines if the current browser is IE.
     * @see https://stackoverflow.com/a/15983064/1136822
     * @returns {*} Returns false if not IE, or the IE major version number int.
     */
    isIE: function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
    }
};

/*
 * Components
 *
 */
/**
 * SITE components.
 * @type {{init: Function}}
 */
SITE.components = {
    /**
     * Algolia search Vue apps.
     *
     * author: Aaron Waldon <aaron@cauisngeffect.com>
     */
    search: function () {
        let apps = document.querySelectorAll('[data-algolia-search]');
        if (apps.length) {
            apps.forEach(function(appEl) {
                let appData = {
                    algoliaAppId: '',
                    algoliaKey: '',
                    algoliaIndexName: '',
                    algoliaIndexOptions: {},
                    disjunctiveFacets: [],
                    facetDefaults: {},
                    facetDisplayLimits: {},
                    facetExclusions: {},
                    facetNames: {},
                    facets: [],
                    hierarchicalFacets: [],
                    options: {},
                    template: null,
                    tags: []
                };
                let client, helper;

                //get the data variable
                let dataVar = appEl.getAttribute('data-var');

                if (dataVar) {
                    appData = Object.assign(appData,window[dataVar]);
                }

                //the event hub
                let eventHub = new Vue();

                //basic info
                let indexName = appData.algoliaIndexName;
                let algoliaIndexOptions = appData.algoliaIndexOptions;

                //template
                let template = appData.template;

                //dynamically set up the facet filter arrays here so that they're reactive
                let facets = appData.facets;
                let selectedFacets = {};
                facets.forEach(function (facet) {
                    selectedFacets[facet] = [];
                });

                //dynamically set up the disjunctive facet filter arrays here so that they're reactive
                let disjunctiveFacets = appData.disjunctiveFacets;
                let selectedDisjunctiveFacets = {};
                disjunctiveFacets.forEach(function (facet) {
                    selectedDisjunctiveFacets[facet] = [];
                });

                //dynamically set up the hierarchical facet filter arrays here so that they're reactive
                let hierarchicalFacets = appData.hierarchicalFacets;
                let selectedHierarchicalFacets = {};
                hierarchicalFacets.forEach(function(facet){
                    selectedHierarchicalFacets[facet.name] = '';
                });

                //set up the default facets (these will always be selected)
                let facetDefaults = appData.facetDefaults;
                for (let facet in facetDefaults) {
                    if (!facetDefaults.hasOwnProperty(facet)){
                        continue;
                    }
                    let value = facetDefaults[facet];
                    if (selectedFacets.hasOwnProperty(facet)) {
                        selectedFacets[facet].push(value);
                    } else if (selectedDisjunctiveFacets.hasOwnProperty(facet)) {
                        selectedDisjunctiveFacets[facet].push(value);
                    } else if (hierarchicalFacets.length) {
                        let temp = SITE.helpers.arrayOfObjectsHasKeyValue(hierarchicalFacets,'name',facet);
                        if (temp !== false) {
                            selectedHierarchicalFacets[facet] = value;
                        }
                    }
                }

                //facet exclusions
                let facetExclusions = appData.facetExclusions;

                //limit to an array of entries?
                let limitToEntries = appData.limitToEntries || false;
                let limitedEntriesMeta = appData.limitedEntriesMeta || [];

                //limit the number of results per page?
                let hitsPerPage = appData.hitsPerPage || false;

                //hidden facets
                let hiddenFacets = appData.hiddenFacets || [];

                //facet sorting
                let facetSorting = appData.facetSorting || {};

                //check the hash?
                let doHashCheck = appData.hasOwnProperty('doHashCheck') ? appData.doHashCheck : true;

                //do an initial search? This is only necessary when facets will be shown.
                let doInitialSearch = appData.hasOwnProperty('doInitialSearch') ? appData.doInitialSearch : true;

                //facet display data
                let facetNames = appData.facetNames || {};
                let displayFacets = [];

                for (let facetSlug in facetNames) {
                    if (!facetNames.hasOwnProperty(facetSlug)){
                        continue;
                    }
                    let facetInfo = facetNames[facetSlug];
                    displayFacets.push({
                        name: facetSlug,
                        displayName: facetInfo.name,
                        data: null,
                        type: '',
                        display: facetInfo.display || 'checkbox'
                    });
                }

                let facetDisplayLimits = {};
                for (let facetName in appData.facetDisplayLimits) {
                    if (!appData.facetDisplayLimits.hasOwnProperty(facetName)){
                        continue;
                    }
                    let settings = appData.facetDisplayLimits[facetName];

                    //ensure that this has a min and max
                    if (!settings.hasOwnProperty('min') || ! settings.hasOwnProperty('max')) {
                       continue;
                    }
                    facetDisplayLimits[facetName] = settings;
                    //set a flag that this facet is not expanded
                    settings.isExpanded = false;
                }

                //tags
                let tags = appData.tags;

                //don't register this component globally or it may end up using the wrong eventHub
                let ItemComponent = {
                    name: 'item',
                    template: '#item-template',
                    delimiters : ['[%', '%]'],
                    props: {
                        model: Object,
                        facetName: '',
                        parentIsRefined: false
                    },
                    methods: {
                        toggle: function () {
                            eventHub.$emit('hierarchical-facet-change', {
                                facet: this.facetName,
                                path: this.model.path,
                                isRefined: this.model.isRefined
                            })
                        },
                        /**
                         * Format number. Uses the accounting.js javascript.
                         *
                         * @param number
                         * @param decimals
                         * @param thousandsSeparator
                         */
                        formatNumber: SITE.helpers.formatNumber,
                        /**
                         * Formats a scripture name.
                         */
                        formatScriptureName: SITE.helpers.formatScriptureName
                    }
                };

                new Vue({
                    components: {
                        'item': ItemComponent
                    },
                    el: appEl,
                    template: template,
                    delimiters : ['[%', '%]'],
                    data: {
                        algoliaIndex: indexName,
                        algoliaIndexOptions: algoliaIndexOptions,
                        displayFacets: displayFacets,
                        facetDisplayLimits: facetDisplayLimits,
                        facetExclusions: facetExclusions,
                        hiddenFacets: hiddenFacets,
                        isInitialSearch: true,
                        isRefined: false,
                        pageLinks: {},
                        query: '',
                        results: [],
                        selectedDisjunctiveFacets: selectedDisjunctiveFacets,
                        selectedFacets: selectedFacets,
                        selectedHierarchicalFacets: Object.assign({}, selectedHierarchicalFacets),
                        showRestoredStateMessage: false,
                        showSearchFilters: false
                    },
                    methods: {
                        /**
                         * Sets up the Algolia search client and index.
                         */
                        algoliaInit: function () {
                            let that = this;

                            //options
                            let options = {
                                highlightPreTag: '<mark>',
                                highlightPostTag: '</mark>',
                                maxValuesPerFacet: 1000
                            };
                            Object.assign(options, appData.options);

                            //add facets to the options if applicable
                            if (facets) {
                                options['facets'] = facets;
                            }
                            //add hierarchical facets to the options if applicable
                            if (hierarchicalFacets) {
                                options['hierarchicalFacets'] = hierarchicalFacets;
                            }
                            if (hitsPerPage) {
                                options['hitsPerPage'] = hitsPerPage;
                            }

                            options['disjunctiveFacets'] = (limitToEntries !== false) ? disjunctiveFacets.concat(['objectID']) : disjunctiveFacets;

                            client = algoliasearch(appData.algoliaAppId, appData.algoliaKey);
                            helper = algoliasearchHelper(client, that.algoliaIndex, options);

                            if (tags.length)
                            {
                                for (let i = 0; i < tags.length; i++) {
                                    let tag = tags[i];
                                    helper.addTag(tag).search();
                                }
                            }

                            helper
                                .on('result',
                                    function (results) {
                                        that.results = results;
                                        that.updateDisplayFacets();
                                        that.updatePagination(results.page, results.nbPages);

                                        //set params from the hash
                                        if (that.isInitialSearch) {
                                            that.isInitialSearch = false;

                                            //update from hash?
                                            let updatedFromHash = false;
                                            if (doHashCheck) {
                                                updatedFromHash = that.setFromHash();
                                            }

                                            //restore state if not updated from hash
                                            if (! updatedFromHash) {
                                                that.restoreState();
                                            }
                                        } else {
                                            that.saveState();
                                        }
                                    })
                                .on('error',
                                    function (error) {
                                        log(error);
                                    });
                        },
                        /**
                         * Runs the Algolia search query.
                         */
                        search: function (page) {
                            let isRefined = false;

                            if (this.query) {
                                isRefined = true;
                            }

                            //set the page and clear the refinements
                            helper
                                .setQuery(this.query)
                                .clearRefinements();

                            //set the facet refinements
                            for (let facetName in this.selectedFacets) {
                                if (!this.selectedFacets.hasOwnProperty(facetName)){
                                    continue;
                                }
                                let facetValues = this.selectedFacets[facetName];
                                if (Array.isArray(facetValues)) {
                                    facetValues.forEach(function (facetValue) {
                                        if (hiddenFacets.indexOf(facetName) < 0) {
                                            isRefined = true;
                                        }
                                        helper.addFacetRefinement(facetName, facetValue);
                                    });
                                }
                            }

                            //set the hierarchical facet refinements
                            for (let facetName in this.selectedHierarchicalFacets)
                            {
                                if (!this.selectedHierarchicalFacets.hasOwnProperty(facetName)){
                                    continue;
                                }
                                let facetValue = this.selectedHierarchicalFacets[facetName];
                                if (facetValue) {
                                    if (hiddenFacets.indexOf(facetName) < 0) {
                                        isRefined = true;
                                    }
                                    helper.addHierarchicalFacetRefinement(facetName,facetValue);
                                }
                            }

                            //set the disjunctive facet refinements
                            for (let facetName in this.selectedDisjunctiveFacets) {
                                if (!this.selectedDisjunctiveFacets.hasOwnProperty(facetName)){
                                    continue;
                                }
                                let facetValues = this.selectedDisjunctiveFacets[facetName];
                                if (Array.isArray(facetValues)) { //checkboxes
                                    facetValues.forEach(function (facetValue) {
                                        if (hiddenFacets.indexOf(facetName) < 0) {
                                            isRefined = true;
                                        }
                                        helper.addDisjunctiveFacetRefinement(facetName, facetValue);
                                    });
                                } else if (!!facetValues) { //non-empty string
                                    if (hiddenFacets.indexOf(facetName) < 0) {
                                        isRefined = true;
                                    }
                                    helper.addDisjunctiveFacetRefinement(facetName, facetValues);
                                }
                            }

                            //set the facet exclusions
                            //this.facetExclusions.forEach(function (facetName, facetValues) {
                            for (let facetName in this.facetExclusions) {
                                if (!this.facetExclusions.hasOwnProperty(facetName)){
                                    continue;
                                }
                                let facetValues = this.facetExclusions[facetName];

                                facetValues.forEach(function (facetValue) {
                                    helper.addFacetExclusion(facetName, facetValue);
                                });
                            }

                            //limit to entries?
                            if (limitToEntries !== false && limitToEntries.length) {
                                limitToEntries.forEach(function(value){
                                    helper.addDisjunctiveFacetRefinement('objectID', value);
                                });
                            }

                            //have the page default to 0 if undefined
                            if (typeof(page) === 'undefined') {
                                page = 0;
                            }

                            //search
                            helper
                                .setPage(page)
                                .search();

                            this.isRefined = isRefined;

                            //make sure the restored state message is not showing
                            this.showRestoredStateMessage = false;
                        },
                        /**
                         * Clears the search fields.
                         */
                        clearSearch: function () {
                            //reset the variables
                            this.query = '';
                            this.pageLinks = {};

                            //clear selected facets
                            this.clearSelectedFacets();

                            //run an empty search query
                            this.search();
                        },
                        /**
                         * Clears all of the selected facets.
                         */
                        clearSelectedFacets: function() {
                            let that = this;
                            //clear the selected facets
                            for (let facetName in this.selectedFacets) {
                                this.selectedFacets[facetName] = [];
                            }

                            //clear the selected disjunctive facets
                            for (let facetName in this.selectedDisjunctiveFacets) {
                                this.selectedDisjunctiveFacets[facetName] = [];
                            }

                            //clear the hierarchical facets
                            this.selectedHierarchicalFacets = {};

                            //set up the default facets
                            for (let facetName in facetDefaults) {
                                if (!facetDefaults.hasOwnProperty(facetName)){
                                    continue;
                                }
                                let value = facetDefaults[facetName];

                                if (selectedFacets.hasOwnProperty(facetName)) {
                                    this.selectedFacets[facetName].push(value);
                                } else if (selectedDisjunctiveFacets.hasOwnProperty(facetName)) {
                                    this.selectedDisjunctiveFacets[facetName].push(value);
                                } else if (hierarchicalFacets.length) {
                                    let temp = SITE.helpers.arrayOfObjectsHasKeyValue(hierarchicalFacets,'name',facetName);
                                    if (temp !== false) {
                                        this.selectedHierarchicalFacets[facetName] = value;
                                    }
                                }
                            }
                        },
                        /**
                         * Updates the pagination array. Modified method from the SearchPlus add-on.
                         */
                        updatePagination: function(currentPage, numberOfPages) {
                            let pages = [];
                            if (currentPage > 3) {
                                pages.push({current: false, number: 1});
                                pages.push({current: false, number: '…', disabled: true});
                            }
                            for (let p = currentPage - 3; p < currentPage + 3; ++p) {
                                if (p < 0 || p >= numberOfPages) continue;
                                pages.push({current: currentPage === p, number: p + 1});
                            }
                            if (currentPage + 3 < numberOfPages) {
                                pages.push({current: false, number: '…', disabled: true});
                                pages.push({current: false, number: numberOfPages});
                            }
                            this.pageLinks = {
                                pages: pages,
                                currentPage: currentPage+1,
                                totalPages: numberOfPages,
                                prevPage: currentPage > 0 ? currentPage : false,
                                nextPage: currentPage + 1 < numberOfPages ? currentPage + 2 : false
                            };
                        },
                        /**
                         * Insert pagination.
                         *
                         * @param page
                         * @param e
                         */
                        paginationClick: function(page, e) {
                            e.preventDefault();

                            //search is 0-based
                            page = page - 1;

                            //check to make sure the page is in range
                            if (page > -1 && page < this.results.nbPages) {
                                this.search(page);
                            }
                        },
                        /**
                         * Toggles the display limit.
                         * @param facetName
                         */
                        toggleDisplayLimit: function(facetName) {
                            if (this.facetDisplayLimits.hasOwnProperty(facetName)) {
                                this.facetDisplayLimits[facetName].isExpanded = ! this.facetDisplayLimits[facetName].isExpanded;
                            }
                        },
                        /**
                         * Determines whether or not to show a facet item in the facet's list.
                         *
                         * @param facetName
                         * @param facetDatumIndex
                         * @returns {boolean}
                         */
                        shouldFacetDisplay: function(facetName, facetDatumIndex) {
                            if (this.facetDisplayLimits.hasOwnProperty(facetName)) {
                                if (this.facetDisplayLimits[facetName].isExpanded) { //expanded
                                    if ( facetDatumIndex >= this.facetDisplayLimits[facetName].max ) {
                                        return false;
                                    }
                                } else { //not expanded
                                    if ( facetDatumIndex >= this.facetDisplayLimits[facetName].min ) {
                                        return false;
                                    }
                                }
                            }

                            return true;
                        },
                        /**
                         * Determines whether or not to show the "Show More"/"Show Fewer" toggle.
                         *
                         * @param facetName
                         * @param facetDataCount
                         * @returns {boolean}
                         */
                        shouldFacetDisplayLimitToggleDisplay: function(facetName, facetDataCount) {
                            if (this.facetDisplayLimits.hasOwnProperty(facetName)) {
                                if ( facetDataCount >= this.facetDisplayLimits[facetName].min ) {
                                    return true;
                                }
                            }

                            return false;
                        },
                        /**
                         * Get object length.
                         * From http://stackoverflow.com/a/5527037/1136822
                         * @param theObject
                         * @returns {Number}
                         */
                        objectLength: function (theObject) {
                            return Object.keys(theObject).length;
                        },
                        /**
                         * Sets facets from the hash.
                         *
                         * @returns {boolean} True if set from hash. False otherwise.
                         */
                        setFromHash: function() {
                            let that = this;

                            //are there changes?
                            let changes = false;

                            //get the params from the hash
                            let params = SITE.helpers.getHashParams();

                            //if no params, bail
                            if ( ! Object.keys(params).length ) {
                                return false;
                            }

                            //get the query
                            let q = SITE.helpers.getHashVar('q', '');
                            if ( this.query !== q ) {
                                this.query = q;
                                changes = true;
                            }

                            //set the selected facets
                            params.forEach(function(paramName, paramValue)
                            {
                                let facet;

                                if ( facets.indexOf(paramName) > -1) {
                                    //make sure that this facet exists
                                    if (that.results && Object.keys(that.results).length && Object.keys(that.results.facets).length) {
                                        facet = SITE.helpers.arrayOfObjectsHasKeyValue(that.results.facets, 'name', paramName);
                                        if (facet !== false) {
                                            if (
                                                facet.data.hasOwnProperty(paramValue)
                                                && that.selectedFacets[paramName].indexOf(paramValue) < 0
                                            ) {
                                                that.selectedFacets[paramName].push(paramValue);
                                                changes = true;
                                            }
                                        }
                                    }
                                } else if ( disjunctiveFacets.indexOf(paramName) > -1) {
                                    //make sure that this facet exists
                                    if (Object.keys(that.results).length && Object.keys(that.results.disjunctiveFacets).length) {
                                        facet = SITE.helpers.arrayOfObjectsHasKeyValue(that.results.disjunctiveFacets, 'name', paramName);
                                        if (facet !== false) {
                                            if (
                                                facet.data.hasOwnProperty(paramValue)
                                                && that.selectedDisjunctiveFacets[paramName].indexOf(paramValue) < 0
                                            ) {
                                                that.selectedDisjunctiveFacets[paramName].push(paramValue);
                                                changes = true;
                                            }
                                        }
                                    }
                                }
                            });

                            //clear the hash
                            window.location.hash = '';

                            //since there are changes, let's run the search
                            if (changes) {
                                this.search();
                                return true;
                            }

                            return false;
                        },
                        /**
                         * Set original state from URL params.
                         */
                        setFromGetParams: function() {
                            //get the query
                            let query = window.location.search.substring(1);

                            //move the query to the hash
                            if(query.length) {
                                if(window.history !== undefined && window.history.replaceState !== undefined) {
                                    window.history.replaceState({}, document.title, window.location.pathname+'#'+query);
                                }
                            }
                        },
                        /**
                         * Ties data from Craft with Algolia results.
                         * @param objectId
                         * @param metaKey
                         * @returns {*}
                         */
                        getMetaValue: function(objectId,metaKey){
                            if (limitedEntriesMeta.hasOwnProperty('_'+objectId)) {
                                if (limitedEntriesMeta['_'+objectId].hasOwnProperty(metaKey)) {
                                    return limitedEntriesMeta['_'+objectId][metaKey];
                                }
                            }
                            return '';
                        },
                        /**
                         * Format number. Uses the accounting.js javascript.
                         *
                         * @param number
                         * @param decimals
                         * @param thousandsSeparator
                         */
                        formatNumber: SITE.helpers.formatNumber,
                        /**
                         * Formats a sorted facet key.
                         */
                        formatSortedFacetKey: SITE.helpers.formatSortedFacetKey,
                        /**
                         * Converts a string to kebab case.
                         */
                        kebabCase: SITE.helpers.kebabCase,
                        /**
                         * Handles hierarchical facet change events.
                         * @param e
                         */
                        hierarchicalFacetChange: function(e) {
                            let delimiter = ' > ';
                            let clickedPath = e.path;
                            let currentPath = this.selectedHierarchicalFacets[e.facet];
                            let newPath = clickedPath;

                            //handle a toggle click
                            if (currentPath && clickedPath === currentPath) {
                                if (clickedPath.indexOf(delimiter) > 0 ) { //just got up a level
                                    newPath = newPath.substring(0, newPath.lastIndexOf(delimiter))
                                } else { //clear the path
                                    newPath = '';
                                }
                            }

                            this.selectedHierarchicalFacets[e.facet] = newPath;
                            this.search();
                        },
                        /**
                         * Builds the level arrays for the refined display facets
                         * if they don't have any results. This allows them to
                         * be unselected.
                         * @param categoryPath
                         * @returns {{}}
                         */
                        buildHierarchicalLevel : function(categoryPath) {

                            //build the nested data array from the provided path
                            let levels = categoryPath.split(' > ');

                            //build the path incrementally
                            let runningLevel = '';
                            levels.forEach(function(lVal, lInd){
                                runningLevel += runningLevel ? ' > ' + lVal : lVal;

                                levels[lInd] = {
                                    name : lVal,
                                    path : runningLevel
                                };
                            });

                            //total number of levels
                            let levelsCount = levels.length;

                            //build the levels with recursive data
                            let buildLevel = function(lVal, lInd) {
                                let nested = {};
                                nested.count = 0;
                                nested.data = null;
                                nested.isRefined = true;
                                nested.name = lVal.name;
                                nested.path = lVal.path;
                                if (lInd + 1 < levelsCount) {
                                    nested.data = [];
                                    nested.data.push( buildLevel(levels[lInd+1], lInd+1) );
                                }
                                return nested;
                            };

                            //get building
                            if (levels && levels.length) {
                                return buildLevel(levels[0], 0);
                            }

                            return false;
                        },
                        /**
                         * Updates the display facet values. This allows the facets
                         * to display in the same order as the facetNames config
                         * setting.
                         */
                        updateDisplayFacets: function(){
                            let that = this;

                            //remove all of the facet data
                            this.displayFacets.forEach(function(facet){
                                facet.data = null;
                            });

                            //loop through the facet types
                            ['facets', 'hierarchicalFacets', 'disjunctiveFacets'].forEach(function(facetType){
                                //set the results
                                if (that.results.hasOwnProperty(facetType)) {
                                    that.results[facetType].forEach(function(facet){
                                        let displayFacet = SITE.helpers.arrayOfObjectsHasKeyValue(that.displayFacets,'name',facet.name);
                                        if (displayFacet) { //found the display facet by name
                                            displayFacet.data = facet.data;
                                            displayFacet.type = facetType;
                                        }
                                    });
                                }

                                //add the refinements if they are not already present
                                let refinementType = facetType+'Refinements';
                                if (that.results['_state'].hasOwnProperty(refinementType)) {
                                    for (let facetName in that.results['_state'][refinementType]) {
                                        if (!that.results['_state'][refinementType].hasOwnProperty(facetName)){
                                            continue;
                                        }
                                        let facetValues = that.results['_state'][refinementType][facetName];

                                        let displayFacet = SITE.helpers.arrayOfObjectsHasKeyValue(that.displayFacets,'name',facetName);
                                        if (displayFacet) { //found the display facet by name

                                            //top level data
                                            displayFacet.count = null;
                                            displayFacet.path = null;
                                            displayFacet.isRefined = true;

                                            facetValues.forEach(function(facetValue) {
                                                if ( facetType === 'hierarchicalFacets' ) {
                                                    if (facetValue) {
                                                        //hierarchical facets need a data array
                                                        if (!displayFacet.data) {
                                                            displayFacet.data = [];
                                                        }

                                                        //build the levels
                                                        let catData = that.buildHierarchicalLevel(facetValue);
                                                        if (catData) {
                                                            let existingLevel = SITE.helpers.arrayOfObjectsHasKeyValue(displayFacet.data,'name',catData.name);
                                                            if (!existingLevel) {
                                                                displayFacet.data.push(catData);
                                                            }
                                                        }
                                                    }
                                                } else { //facets and disjunctive facets
                                                    //non-hierarchical facets need a data object
                                                    if (!displayFacet.data) {
                                                        displayFacet.data = {};
                                                    }

                                                    if (!displayFacet.data.hasOwnProperty(facetValue)) {
                                                        displayFacet.data[facetValue] = {};
                                                    }
                                                }
                                            });
                                            displayFacet.data = Object.keys(displayFacet.data).length ? displayFacet.data : null;
                                        }
                                    }
                                }
                            });

                            //sort the display facets
                            this.displayFacets.forEach(function(facet){
                                if (facetSorting.hasOwnProperty(facet.name)) {
                                    if (facet.data && facetSorting[facet.name].sortBy.indexOf('name') === 0) {
                                        let isAsc = (facetSorting[facet.name].sortBy.indexOf(':desc') < 0);
                                        facet.data = SITE.helpers.sortObjectByKeys(facet.data, isAsc);
                                    }
                                }
                            });
                        },
                        /**
                         * Restores the state from local storage.
                         *
                         * @returns {boolean} True if restored, false if not.
                         */
                        restoreState: function() {
                            //don't restore state for global search
                            if (! doInitialSearch) {
                                return false;
                            }
                            let that = this;
                            let searchAfter = false;
                            let path = window.location.pathname;
                            let state = simpleStorage.get(dataVar);

                            //make sure we have a valid state
                            if (state && state.hasOwnProperty('path')) {
                                //only restore state if we are on the same page as last time
                                if (path === state.path) {
                                    //loop through the state items
                                    for (let key in state) {
                                        if (!state.hasOwnProperty(key)){
                                            continue;
                                        }
                                        let value = state[key];
                                        //if the current value exists and differs from the saved value
                                        if (that.$data.hasOwnProperty(key) && that[key] !== value) {
                                            //set the current value to the new value
                                            that[key] = value;

                                            searchAfter = true;
                                        }
                                    }
                                }
                            }

                            if (searchAfter) {
                                this.search();
                                this.showRestoredStateMessage = true;
                            }

                            return searchAfter;
                        },
                        /**
                         * Saves the state to local storage
                         */
                        saveState: function() {
                            //don't save state for global search
                            if (! doInitialSearch) {
                                return;
                            }

                            //get a copy of the app data
                            let state =  Object.assign({}, this.$data);

                            //remove the properties we don't want to store
                            let keysToRemove = [
                                'displayFacets',
                                'facetDisplayLimits',
                                'facetExclusions',
                                'isInitialSearch',
                                'isRefined',
                                'pageLinks',
                                'results',
                                'showRestoredStateMessage'
                            ];
                            keysToRemove.forEach(function(key){
                                delete state[key];
                            });

                            //remember the path in the state
                            state.path = window.location.pathname;

                            //store the state to local storage
                            let ttl = 1000 * 60 * 60; //1 hour
                            simpleStorage.set(dataVar, state, {TTL: ttl});
                        },
                        /**
                         * Dismisses the restored state message.
                         */
                        dismissRestoredStateMessage: function() {
                            this.showRestoredStateMessage = false;
                        },
                        /**
                         * Toggles the showSearchFilters value.
                         */
                        toggleMobileFilters: function() {
                            this.showSearchFilters = ! this.showSearchFilters;
                        }
                    },
                    watch: {
                        algoliaIndex: function(newIndex) {
                            let currentIndex = helper.getIndex();
                            if (newIndex !== currentIndex) {
                                helper.setIndex(newIndex);
                                this.search();
                            }
                        }
                    },
                    computed: {
                        hasFilters: function(){
                            let hasFilters = false;

                            //check if there are any display facets that are not hidden
                            if (this.displayFacets && this.displayFacets.length) {
                                this.displayFacets.forEach(function(facet) {
                                    if (hiddenFacets.indexOf(facet.name) < 0) {
                                        hasFilters = true;
                                    }
                                });
                            }

                            return hasFilters;
                        }
                    },
                    created: function(){
                        eventHub.$on('hierarchical-facet-change', this.hierarchicalFacetChange);
                    },
                    beforeDestroy: function(){
                        eventHub.$off('hierarchical-facet-change', this.hierarchicalFacetChange);
                    },
                    mounted: function () {
                        let that = this;
                        this.algoliaInit();
                        this.setFromGetParams();

                        if (doInitialSearch) {
                            this.search();
                        }

                        this.$refs.searchBox.focus();
                    }
                });
            });
        }
    },
    /**
     * Drawer functionality.
     */
    drawers: function() {

        let openedClass = 'drawer--open';
        let closedClass = 'drawer--closed';

        let toggleEls = document.querySelectorAll('[data-drawer-toggle]');
        let htmlEl = document.documentElement;

        if (toggleEls.length) {
            toggleEls.forEach((toggleEl) => {

                let toggleId = toggleEl.getAttribute('data-drawer-toggle');
                let closeId = toggleEl.getAttribute('data-drawer-close');
                let bodyClass = toggleEl.getAttribute('data-drawer-doc-class');

                let drawersToToggleEls = toggleId ? document.querySelectorAll('[data-drawer="'+toggleId+'"]') : [];
                let drawersToCloseEls = closeId ? document.querySelectorAll('[data-drawer="'+closeId+'"]') : [];

                if (drawersToToggleEls.length) {

                    toggleEl.addEventListener('click', (e) => {
                        e.preventDefault();
                        drawersToToggleEls.forEach((drawerEl) => {

                           if (drawerEl.classList.contains(openedClass)) {

                               // Closing a drawer

                               drawerEl.classList.add(closedClass);
                               drawerEl.classList.remove(openedClass);

                               // Remove the body class
                               if (bodyClass) {
                                   htmlEl.classList.remove(bodyClass);
                               }

                           } else {

                               // Opening a drawer

                               drawerEl.classList.add(openedClass);
                               drawerEl.classList.remove(closedClass);

                               // Add the body class
                               if (bodyClass) {
                                   htmlEl.classList.add(bodyClass);
                               }

                               // Close any competing drawers
                               drawersToCloseEls.forEach((drawerEl) => {
                                   drawerEl.classList.add(closedClass);
                                   drawerEl.classList.remove(openedClass);
                               });

                           }

                        });
                    });

                }

            });
        }

    },
    /**
     * Creates styles to compensate for the scrollbar when the
     * mobile menu is open.
     */
    scrollbarCompensation: function () {
        let ieVersion = SITE.helpers.isIE();
        if (!ieVersion || ieVersion < 9) {
            //get the scrollbar width
            let scrollbarWidth = SITE.helpers.getScrollbarWidth();

            let compensatorScripts = document.querySelectorAll('[data-scrollbar-compensation]');
            if (compensatorScripts.length) {
                compensatorScripts.forEach(function (compensatorScript) {
                    //parse the styles
                    let styles = compensatorScript.innerHTML;
                    styles = styles.replace(/\{sbw\}/g, scrollbarWidth);

                    //add the styles
                    let style = document.createElement('style');
                    style.type = 'text/css';
                    style.innerHTML = styles;
                    document.getElementsByTagName('head')[0].appendChild(style);
                });
            }
        }
    },
    /**
     * Do the Flickity.
     */
    flickity: function() {
        let flickities = document.querySelectorAll('[data-flkty]');
        if (flickities.length) {
            flickities.forEach(function(flickityEl) {
                new Flickity( flickityEl, {
                    cellAlign: 'left',
                    contain: true,
                    wrapAround: false,
                    watchCSS: true,
                    pageDots: false
                });
            })
        }
    },
    /**
     * Initializes the specified components.
     */
    init: function() {
        SITE.components.search();
        SITE.components.scrollbarCompensation();
        SITE.components.drawers();
        SITE.components.flickity();
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    //initialize components
    SITE.components.init();
});


window.SITE = SITE;
