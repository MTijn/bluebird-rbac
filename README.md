# Bluebird RBAC

Role based access control that uses Mongoose and Bluebird promises. I have created the library since I was not able to
work with the available libraries on GitHub.

## Requirements

- Mongoose
- Bluebird
- A user model

## Installation
To install from NPM use:
```
npm install bluebird-rbac
```

U have to register the RBAC plugin to the User model. This is achieved by:

```js
var mongoose = require('mongoose');
var rbac = require('bluebird-rbac').rbac;

var UserSchema = mongoose.Schema({
  // ... Any additional fields
});
 
UserSchema.plugin(rbac.plugin);
 
module.exports = mongoose.model('User', UserSchema);
```

## API

### User
#### hasRole(role, done)
Checks if the user has the specified role.

#### addRole(role, done)
Adds the role to the user.

#### removeRole(role, done)
Remove the role from the user

#### can(action, subject, done)
Is the user allowed to perform the action.

#### hasPermissions()
Will return all the permissions the user has.

## Express middleware
You will be able to check for permissions on the routes from express.

```js
var rbac = require('bluebird-rbac');

router.get('/', rbac.userCanAccess({action: 'view', resource: 'user', redirectTo: '/'}), function(req, res, next) {
    // Do stuff in my route.
});
```
If the user does not have the permission, the user will be redirected to /, if redirectTo is not defined
the user will be returned to the last page he visited.
