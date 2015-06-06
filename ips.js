'use strict';

var debug = require('debug')('loopback-ds-ips-mixin');
var ipware = require('ipware');

module.exports = function ips(Model, options) {
  debug('IPs mixin for Model [%s]', Model.modelName);

  var createdByIp = options.createdByIp || 'createdByIp';
  var updatedByIp = options.updatedByIp || 'updatedByIp';
  var required = (options.required === undefined ? true : options.required);

  debug('createdByIp', createdByIp, options.createdByIp);
  debug('updatedByIp', updatedByIp, options.updatedByIp);

  Model.defineProperty(createdByIp, {type: String, required: required});
  Model.defineProperty(updatedByIp, {type: String, required: required});

  Model.observe('before save', function event(context, next) {
    var isNewInstance = context.isNewInstance;
    var options = context.options;
    var skipUpdatedByIp = (options && options.skipUpdatedByIp);

    if (!isNewInstance && skipUpdatedByIp) {
      return next();
    }

    var request = context.req;
    var ip = '0.0.0.0';
    if (request) {
      try {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        ip = ipware().get_ip(request).clientIp; // jshint ignore:line
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      } catch (ex) {
        debug('Error getting client IP!', ex);
      }
    }

    if (isNewInstance) {
      context.instance[createdByIp] = ip;
      debug('%s.%s: [%s]', context.Model.modelName, createdByIp, ip);
    }

    if (!skipUpdatedByIp) {
      if (context.instance) {
        debug('%s.%s: [%s][%s]', context.Model.modelName, updatedByIp, context.instance.id, ip);
        context.instance[updatedByIp] = ip;
      } else {
        debug('%s.%s: [%j][%s]', context.Model.pluralModelName, updatedByIp, context.where, ip);
        context.data[updatedByIp] = ip;
      }
    }

    next();
  });

};
