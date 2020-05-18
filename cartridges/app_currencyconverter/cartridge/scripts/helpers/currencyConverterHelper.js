'use strict';

const Site = require('dw/system/Site');
const Logger = require('dw/system/Logger').getLogger('currencyConverter', 'CurrencyConverter');

var fixerService = require('*/cartridge/scripts/services/fixer').getService();

/**
 * Gets all available currencies
 * @returns {Object} currencies object in format - { 'code': 'currency name', ...}
 */
function getAvailableCurrencies() {
    try {
        let fixerResponse = fixerService.call('symbols');
        if (fixerResponse.status === 'OK' && fixerResponse.object.success == true) {
            return fixerResponse.object.symbols;
        } else {
            return fixerResponse.object;
        }
    } catch (e) {
        Logger.error('Error duaring fixer service call - symbol endpoint');

        let result;
        result.success = false;
        result.error = {
            code: 106,
            info: e.message
        }

        return result;
    }
}

/**
 * Calls service or gets custom object for rates
 * @param {string} from - input currency code
 * @returns {Object} latest rates for input currency
 */
function getRates(from) {
    // firstly check if currency rates are cached in custom object - CurrencyRates
    let ratesObj = getObjectCurrencyRates(from);
    if (ratesObj) {
        try {
            let rates = JSON.parse(ratesObj.custom.rates);
            return {
                'rates': rates
            };
        } catch (ex) {
            Logger.error('Error duaring custom object parse');
            return {};
        }
    }
    try {
        let fixerResponse = fixerService.call('latest', {'base': from});
        if (fixerResponse.status === 'OK' && fixerResponse.object.success == true) {
            saveObjectCurrencyRates(from, fixerResponse.object);
        }
        return fixerResponse.object;
    } catch (e) {
        Logger.error('Error duaring fixer service call - latest endpoint');

        let result;
        result.success = false;
        result.error = {
            code: 106,
            info: e.message
        }
        return result;
    }
}

/**
 * Gets custom object for input currency and check if rates still relevant
 * @param {string} currencyFrom - input currency code
 */
function getObjectCurrencyRates(currencyFrom) {
    const CustomObjectMgr = require('dw/object/CustomObjectMgr');
    const cachedTime = Site.getCurrent().getCustomPreferenceValue('fixerCachedTime');

    let ratesObj = CustomObjectMgr.getCustomObject('CurrencyRates', currencyFrom);
    if (ratesObj) {
        let currentTimestamp = Date.now();
        if (currentTimestamp - ratesObj.custom.timestamp > cachedTime) {
            CustomObjectMgr.remove(ratesObj);
            return null;
        }
        return ratesObj;
    }
    return null;
}

/**
 * Save currency rates into custom object
 * @param {string} currencyFrom - input currency code
 * @param {Object} fixerResponse - service response with latest rates
 */
function saveObjectCurrencyRates(currencyFrom, fixerResponse) {
    const CustomObjectMgr = require('dw/object/CustomObjectMgr');
    const Transaction = require('dw/system/Transaction');

    Transaction.wrap(function () {
        let currencyRates = CustomObjectMgr.createCustomObject('CurrencyRates', currencyFrom);
        currencyRates.custom.timestamp = Date.now();
        currencyRates.custom.rates = JSON.stringify(fixerResponse.rates);
    });
}

module.exports = {
    getAvailableCurrencies: getAvailableCurrencies,
    getRates: getRates
}