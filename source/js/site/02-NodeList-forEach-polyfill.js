/**
 * Fix for IE to get NodeList.forEach to work as expected.
 *
 * @see http://tips.tutorialhorizon.com/2017/01/06/object-doesnt-support-property-or-method-foreach/
 */
(function () {
    if (typeof NodeList.prototype.forEach === "function") return false;
    NodeList.prototype.forEach = Array.prototype.forEach;
})();