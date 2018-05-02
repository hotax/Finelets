const place = function (data) {
};
const list = function () {
}

module.exports = {
    url: '/api/sales/order/placements',
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