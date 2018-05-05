module.exports = function (messageSendor, orderFactory) {
    return {
        draftOrder: function (raw) {
            var order;
            return orderFactory.create(raw)
                .then(function (data) {
                    order = data;
                    return messageSendor.draftSalesOrder(data);
                })
                .then(function () {
                    return order;
                })

        },
        commitDraftOrderToPreview: function (orders) {
            var actions = [];
            orders.forEach(function (orderId) {
                actions.push(messageSendor.commitDraftSalesOrderToPreview(orderId));
            });
            return Promise.all(actions);
        }
    }
};