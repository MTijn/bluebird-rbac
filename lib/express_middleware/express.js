/**
 * Created by martijnk on 12-8-16.
 */
/**
 * @param {array} options
 * @return {Function}
 */
module.exports = function userCanAccess(options) {
    options = options || {};

    var url = options.redirectTo || 'back';
    var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

    var action = options.action;
    var resource = options.resource;

    return function(req, res, next) {
        req.user.can(action, resource, function(err, canPerform) {
            if (err || canPerform === false) {
                return res.redirect(url);
            }
        });
        next();
    }
};