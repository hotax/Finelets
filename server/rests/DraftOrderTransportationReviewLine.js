const line = function () {
};

module.exports = {
    url: '/api/transportation/reviewlines/orders/draft',
    rests: [
        {
            type: 'query',
            element: 'DraftOrderToTransportationReview',
            handler: line
        }
    ]
};