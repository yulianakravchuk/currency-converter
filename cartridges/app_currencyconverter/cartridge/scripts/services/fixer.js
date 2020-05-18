'use strict';

const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const Site = require('dw/system/Site');
const Logger = require('dw/system/Logger').getLogger('currencyConverter', 'CurrencyConverter');

module.exports.getService = function () {
    return LocalServiceRegistry.createService('fixer.http.currencyconverter', {
        createRequest: function (service, endpoint, params) {
            let accessKey = Site.getCurrent().getCustomPreferenceValue('fixerAPIKey');
            let fixerHost = Site.getCurrent().getCustomPreferenceValue('fixerHost');

            if (!accessKey) {
                Logger.error('Access Key site preference is not filled');
                return null;
            }
            if (!fixerHost) {
                Logger.error('Fixer service host site preference is not filled');
                return null;
            }

            service.setRequestMethod('GET');
            service.setURL(fixerHost + endpoint);
            service.addParam('access_key', accessKey);
            // if params is not empty go through all list of properties and add them to the call
            if (!empty(params)) {
                Object.keys(params).forEach(function (key) {
                    if (params[key]) {
                        service.addParam(key, params[key]);
                    }
                });
            }
            return service;
        },
        parseResponse: function (service, result) {
            return JSON.parse(result.text);
        }
    });
};