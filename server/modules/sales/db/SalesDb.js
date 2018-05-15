const dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'),
    orderStatusValue = require('./models/SalesOrderStatus'),
    dbSchema = require('./DbModels');

module.exports = {
    createOrder: function (raw) {
        return dbSave(dbSchema.SalesOrder, raw);
    },
    getOrder: function (id) {
        return dbSchema.SalesOrder.findById(id)
            .then(function (obj) {
                return obj ? obj.toJSON() : obj;
            })
    },
    listUnlockedDraftOrders: function (fields) {
        var results = [];
        return dbSchema.SalesOrder.find({status: orderStatusValue.statusValues.DRAFT})
            .select(fields)
            .exec()
            .then(function (data) {
                data.forEach(function (item) {
                    results.push(item.toJSON());
                });
                return results;
            })
    }
};