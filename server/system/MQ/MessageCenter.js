module.exports = function (mqImpl) {
    return {
        draftSalesOrder: function (raw) {
            return mqImpl.publish('draftSalesOrder', raw);
        }
    }
};