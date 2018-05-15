const messageSendor = require('../../system/MQ'),
    salesDb = require('./db/SalesDb'),
    sales = require('./Sales');

const orderFactory = {
    create: function (raw) {
        return salesDb.createOrder(raw);
    }
};

module.exports = {
    Sales: sales(messageSendor, orderFactory)
};

