/**
 * Created by martijnk on 10-8-16.
 */
var mongoose = require('mongoose');
var PermissionSchema;
var Permission;
var RoleSchema;
var Role;

PermissionSchema = mongoose.Schema({
    resource: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    created_at: Date,
    updated_at: Date
});

RoleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }]
});

/**
 * @param {string|array} params
 * @param callback
 * @return bluebird
 */
PermissionSchema.statics.findOrCreate = function (permissionArray, callback) {
    this.findOne({resource: permissionArray[0], action: permissionArray[1]}, function(err, permission) {
        if (err) {
            callback(err);
        }
        if (permission) {
            callback(null, permission);
        }

        var newPermission = new Permission();
        newPermission.resource = permissionArray[0];
        newPermission.action = permissionArray[1];
        newPermission.name = permissionArray[2];
        newPermission.save(function(err) {
            callback(null, newPermission);
        });
    });
};

function user(schema, options) {
    options || (options = {});

    function resolveRole(role, done) {
        if (typeof role === 'string') {
            mongoose.model('Role').findOne({ name: role }, function (err, role) {
                if (err) {
                    return done(err);
                }
                if (!role) {
                    return done(new Error("Unknown role"));
                }
                done(null, role);
            });
        } else {
            done(null, role);
        }
    }

    schema.add({
        roles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        }]
    });

    schema.methods.hasRole = function (role, done) {
        var user = this;
        resolveRole(role, function(err, role) {
            if (err) {
                done(err);
            }
            var hasRole = false;
            user.roles.forEach(function(existing) {
                if ((existing._id && existing._id.equals(role._id)) ||
                    (existing.toString() === role._id)) {
                    hasRole = true;
                }
            });
            done(null, hasRole);
        });
    };

    schema.methods.addRole = function (role, done) {
        var user = this;
        resolveRole(role, function(err, role) {
            if (err) {
                done(err);
            }
            user.hasRole(role, function(err, has) {
                if (err) {
                    return done(err);
                }
                if (has) {
                    return done(null, user);
                }
                user.roles = [role._id].concat(user.roles);
                user.save(done);
            })
        });
    };

    schema.methods.removeRole = function (role, done) {

    }

    schema.methods.can = function (action, subject, done) {

    }
}

function init(rolesAndPermissions, done) {
    for (var roleName in rolesAndPermissions) {
        role = new Role();
        role.name = roleName;
        for (var i in rolesAndPermissions[role.name]) {
            Permission.findOrCreate(rolesAndPermissions[role.name][i], function(err, data) {
                if (err) {
                    done(err);
                }
                role.permissions.push(data._id);
                role.save(function(err) {
                    if (err) {
                        done(err);
                    }
                });
            })
        };
        role.save();
        done(null, role);
    }
}

module.exports.Permission = Permission = mongoose.model('Permission', PermissionSchema);
module.exports.Role = Role = mongoose.model('Role', RoleSchema);
module.exports.user = user;
module.exports.init = init;