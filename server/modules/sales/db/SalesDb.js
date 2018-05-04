const dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'),
    dbSchema = require('./DbSchema');

module.exports = {
    createOrder: function (raw) {
        return dbSave(dbSchema.SalesOrder, raw);
    }
};