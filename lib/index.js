exports.rbac = require('./rbac/rbac');

/**
 * @param {array} options
 * @return {Function}
 */
module.exports.userCanAccess = function(options) {
    options = options || {};

    var url = options.redirectTo || 'back';

    var action = options.action;
    var resource = options.resource;

    return function(req, res, next) {
        if (req.user === undefined) {
            return res.redirect('/');
        }
        req.user.can(action, resource, function(canAccess) {
            if (canAccess === false) {
                return res.redirect(url);
            }
            if (canAccess === true) {
                next();
            }
        });
    }
};