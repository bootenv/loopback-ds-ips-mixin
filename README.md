[![NPM](https://nodei.co/npm/loopback-ds-ips-mixin.png?compact=true)](https://nodei.co/npm/loopback-ds-ips-mixin/)

[![license](https://img.shields.io/badge/license-Apache_2.0-blue.svg)]()
[![engine](https://img.shields.io/badge/iojs-v2.1.0-yellow.svg)]()
[![npm](https://img.shields.io/npm/v/npm.svg)]()
[![Build Status](https://travis-ci.org/bootenv/loopback-ds-ips-mixin.svg?branch=master)](https://travis-ci.org/bootenv/loopback-ds-ips-mixin)
[![Coverage Status](https://coveralls.io/repos/bootenv/loopback-ds-ips-mixin/badge.svg)](https://coveralls.io/r/bootenv/loopback-ds-ips-mixin)

> This module is based on [loopback-ds-timestamp-mixin](https://github.com/clarkbw/loopback-ds-timestamp-mixin) by [Bryan Clark](https://github.com/clarkbw). _Thanks for heading us in the right direction!_

IPS
=============

This module is designed for the [Strongloop Loopback](https://github.com/strongloop/loopback) framework.  It adds `createdByIp` and `updatedByIp` attributes to any Model. 

`createdByIp` will be set the _user's_ (_client's_) real IP-Address using [ipware](https://github.com/un33k/node-ipware).

`updatedByIp` will be set for every update of an object through bulk `updateAll` or instance `model.save` methods.

This module is implemented with the `before save` [Operation Hook](http://docs.strongloop.com/display/public/LB/Operation+hooks#Operationhooks-beforesave) which is relatively new to the loopback framework so your loopback-datasource-juggler module must greater than version [2.23.0](0002aaedeffadda34ae03752d03d0805ab661665).

INSTALL
=============

```bash
  npm install --save loopback-ds-ips-mixin
```

MIXINSOURCES
=============
With [loopback-boot@v2.8.0](https://github.com/strongloop/loopback-boot/)  [mixinSources](https://github.com/strongloop/loopback-boot/pull/131) have been implemented in a way which allows for loading this mixin without changes to the `server.js` file previously required.

Add the `mixins` property to your `server/model-config.json` like the following:

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "../node_modules/loopback-ds-ips-mixin",
      "../common/mixins"
    ]
  }
}
```

SERVER.JS
=============

DEPRECATED: See MIXINSOURCES above for configuration. Use this method ONLY if you cannot upgrade to loopback-boot@v2.8.0.

In your `server/server.js` file add the following line before the `boot(app, __dirname);` line.

```js
...
var app = module.exports = loopback();
...
// Add IPs Mixin to loopback
require('loopback-ds-ips-mixin')(app);

boot(app, __dirname, function(err) {
  'use strict';
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
```

CONFIG
=============

To use with your Models add the `mixins` attribute to the definition object of your model config.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      }
    },
    "mixins": {
      "IPs" : true
    }
  }
```

BOOT OPTIONS
=============

The attribute names `createdByIp` and `updatedByIp` are configurable.  To use different values for the default attribute names add the following parameters to the mixin options.

You can also configure whether `createdByIp` and `updatedByIp` are required or not. This can be useful when applying this mixin to existing data where the `required` constraint would fail by default.

In this example we change `createdByIp` and `updatedByIp` to `createdIp` and `lastUpdatedIp`, respectively. We also change the default `required` to `false`.

```json
  {
    "name": "Widget",
    "properties": {
      "name": {
        "type": "string",
      }
    },
    "mixins": {
      "IPs" : {
        "createdByIp" : "createdIp",
        "updatedByIp" : "lastUpdatedIp",
        "required" : false
      }
    }
  }
```

OPERATION OPTIONS
=============

By passing in additional options to an update or save operation you can control when this mixin updates the `updatedByIp` field.  The passing true to the option `skipUpdatedByIp` will skip updating the `updatedByIp` field.

In this example we assume a book object with the id of 2 already exists. Normally running this operation would change the `updatedByIp` field to a new value.

```js
Book.updateOrCreate({name: 'New name', id: 2}, {skipUpdatedByIp: true}, function(err, book) {
  // book.updatedAt will not have changed
});
```

TESTING
=============

You'll need `jscs` and `jshint` globally installed to run the tests which can be installed with this command: `npm install -g jshint jscs`.  These tools help maintain style and error checking.

Run the tests in `test.js`

```bash
  npm test
```

Run with debugging output on:

```bash
  DEBUG='loopback-ds-ips-mixin' npm test
```

VERSIONS
=============

 - [1.0.0](https://github.com/bootenv/loopback-ds-ips-mixin/releases/tag/1.0.0) 
 - 1.0.1 ([current](https://github.com/bootenv/loopback-ds-ips-mixin/releases/tag/1.0.1))

LICENSE
=============
[Apache-2.0](LICENSE)
