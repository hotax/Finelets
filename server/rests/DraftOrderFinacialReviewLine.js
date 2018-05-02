const line = function () {
};

module.exports = {
    url: '/api/financial/reviewlines/orders/draft',
    rests: [
        {
            type: 'query',
            element: 'DraftOrderToFinancialReview',
            handler: line
        }
    ]
};