module.exports = function (db) {
    return {
        list: function () {
            return db.listUnlockedDraftOrders();
        }
    }
};