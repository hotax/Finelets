module.exports = function (messageSendor) {
    return {
        draftOrder: function (raw) {
            return messageSendor.draftSalesOrder(raw);
        }
    }
}