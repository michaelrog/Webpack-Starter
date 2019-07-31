/*
 * Site globals
 */

window.SITE_config = window.SITE_config || {};
window.SITE = window.SITE || {};

/*
 * console.log polyfill
 *
 * c.f. http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
 */

window.log = function log() {

	if (!SITE_config.devMode) return;

	log.history = log.history || [];
	log.history.push(arguments);

	if(this.console){
		items = Array.prototype.slice.call(arguments);
		if (items.length == 1)
		{
			console.log( 'TC: ', Array.prototype.slice.call(arguments).shift() );
		}
		else
		{
			console.group('TC: ', items.shift());
			for (var i=0; i < items.length; i++)
			{
				console.log(items[i]);
			}
			console.groupEnd();
		}

	}

};
