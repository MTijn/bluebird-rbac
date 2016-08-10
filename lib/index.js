/**
 * Created by martijnk on 10-8-16.
 */
var mongoose = require('mongoose');
var PermissionSchema;
var Permission;
var RoleSchema;
var Role;

mongoose.Promise = require('bluebird');

PermissionSchema = mongoose.Schema({
	resource: {
		type: String,
		required: true
	},
	action: {
		type: String,
		required: true
	},
	name: String,
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

module.exports.Permission = Permission = mongoose.model('Permission', PermissionSchema);
module.exports.Role = Role = mongoose.model('Role', RoleSchema);
module.exports.plugin = plugin;