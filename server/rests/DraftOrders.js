const sales = require('../modules/sales').Sales,
    stateConst = require('../../server/modules/sales/db/models/SalesOrderStatus'),
    salesOrderStates = require('../../server/modules/db/SalesOrderStates');

const place = function (data) {
    return sales.draftOrder(data);
};

const list = function () {
    return salesOrderStates.listOnState(stateConst.statusValues.DRAFT)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/api/sales/orders/drafts',
    rests: [
        {
            type: 'create',
            target: 'DraftOrder',
            handler: place
        },
        {
            type: 'query',
            element: 'DraftOrder',
            handler: list
        }
    ]
};