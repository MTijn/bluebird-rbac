/**
 * Created by martijnk on 10-8-16.
 */
var mongoose = require('mongoose');
var bluebird = require('bluebird');
var PermissionSchema;
var Permission;
var RoleSchema;
var Role;

mongoose.Promise = bluebird;

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
        ref: 'Permission',
        unique: true
    }]
});

/**
 * @param {array} permissionArray
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

function plugin(schema, options) {
    options || (options = {});

    function resolveRole(role, done) {
        if (typeof role === 'string') {
            Role.findOne({ name: role }, function (err, role) {
                if (err) {
                    return done(err);
                }
                if (role === null) {
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
        console.log(user);
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
                user.save(function() {
                    done();
                });
            })
        });
    };

    schema.methods.removeRole = function (role, done) {

    }

    schema.methods.can = function (action, subject, done) {

    }
}

function init(rolesAndPermissions, done) {
    var roleArray = [];
    for (var roleName in rolesAndPermissions) {
        roleArray.push(new bluebird(function(resolve, reject) {
            var role = new Role();
            role.name = roleName;
            role.save(function(err) {
                var permissionArray = [];
                for (var i in rolesAndPermissions[role.name]) {
                    permissionArray.push(new bluebird(function(resolve, reject) {
                        Permission.findOrCreate(rolesAndPermissions[role.name][i], function(err, permission) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(permission);
                            }
                        });
                    }));
                }
                bluebird.each(permissionArray, function(permission) {
                    role.permissions.push(permission._id);
                });
                bluebird.all(permissionArray).then(function() {
                    role.save(function(err) {
                        resolve(role);
                    });
                });
            });
        }));
    }
    bluebird.all(roleArray).then(function() {
        done(null, 'Done');
    }).catch(function() {
        done('Error');
    });
}

module.exports.Permission = Permission = mongoose.model('Permission', PermissionSchema);
module.exports.Role = Role = mongoose.model('Role', RoleSchema);
module.exports.plugin = plugin;
module.exports.init = init;