const line = function () {
};

module.exports = {
    url: '/api/quality/reviewlines/orders/draft',
    rests: [
        {
            type: 'query',
            element: 'DraftOrderToQualityReview',
            handler: line
        }
    ]
};