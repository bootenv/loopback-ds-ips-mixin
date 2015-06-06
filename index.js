'use strict';

var deprecate = require('util').deprecate;

module.exports = deprecate(function mixin(app) {
  app.loopback.modelBuilder.mixins.define('IPs', require('./ips'));
}, 'DEPRECATED: Use mixinSources, see https://github.com/bootenv/loopback-ds-ips-mixin#mixinsources');
