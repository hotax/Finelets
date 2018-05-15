const sales = require('../modules/sales').Sales;

const place = function (data) {
    return sales.draftOrder(data);
};

const list = function () {
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
}