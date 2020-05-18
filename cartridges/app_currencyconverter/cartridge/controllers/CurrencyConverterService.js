'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    const currencyConverterHelper = require('*/cartridge/scripts/helpers/currencyConverterHelper');

    let availableCurrencies = currencyConverterHelper.getAvailableCurrencies();
    if (!availableCurrencies) {
        res.render('currencyconverter/home', {
            success: false,
            error: {
                code: '575',
                info: 'Service is not enable'
            }
        });
        return next();
    }
    if (availableCurrencies.error) {
        res.render('currencyconverter/home', availableCurrencies);
        return next();
    }
    res.render('currencyconverter/home', {
        availableCurrencies: availableCurrencies,
        success: true
    });
    next();
});

server.get('UpdateRates', server.middleware.https, function (req, res, next) {
    let CurrencyPageModel = require('*/cartridge/models/currencyPage');
    let currencyFrom = req.querystring.currencyFrom;
    let currencyTo = req.querystring.currencyTo;
    let count = req.querystring.count;

    let currencyPageModel = new CurrencyPageModel(currencyFrom, currencyTo, count);

    if (!currencyPageModel) {
        res.json({
            success: false,
            error: {
                code: '575',
                info: 'Service is not enable'
            }
        });
        return next();
    }

    res.json(currencyPageModel);
    next();
});

module.exports = server.exports();
