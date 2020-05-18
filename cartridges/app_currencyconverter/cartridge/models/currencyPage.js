'use strict';

const Site = require('dw/system/Site');
const currencyConverterHelper = require('*/cartridge/scripts/helpers/currencyConverterHelper');

/**
 * Currency Page Model for home page
 * @param {string} currencyFrom - input currency code
 * @param {string} currencyTo - output currency code
 * @param {number} count - amount of money
 */
function CurrencyPageModel(currencyFrom, currencyTo, count) {
    this.countFrom = count || 1;
    this.currencyFrom = currencyFrom || Site.getCurrent().getCustomPreferenceValue('fixerDefaultCurrencyFrom');
    this.currencyTo = currencyTo || Site.getCurrent().getCustomPreferenceValue('fixerDefaultCurrencyTo');
    let ratesResponse = currencyConverterHelper.getRates(this.currencyFrom);

    if (ratesResponse.success === true) {
        this.rates = ratesResponse.rates;
        this.success = true;
    } else {
        this.error = ratesResponse;
    }
}

module.exports = CurrencyPageModel;