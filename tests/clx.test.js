const proxyquire = require('proxyquire'),
    mongoose = require('mongoose'),
    dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Application', function () {
    var func, stubs, err, reason, createReasonStub;
    beforeEach(function () {
        stubs = {};
        err = new Error('any error message');
        reason = {reason: 'any reason representing any error'}
        createReasonStub = sinon.stub();
        stubs['@finelets/hyper-rest/app'] = {createErrorReason: createReasonStub};
    });

    describe('销售人员', function () {
        describe('草拟订单', function () {
            var sales, orderData, taskStatus;
            var messageSendor;
            it('成功', function () {
                orderData = {orderData: 'any order data'};
                taskStatus = {taskStatus: 'any taskStatus'};
                messageSendor = {
                    draftSalesOrder: sinon.stub()
                };
                messageSendor.draftSalesOrder.withArgs(orderData).returns(Promise.resolve(taskStatus));
                sales = require('../server/modules/sales/Sales')(messageSendor);
                return sales.draftOrder(orderData)
                    .then(function (data) {
                        expect(data).eqls(taskStatus);
                    })
            });
        })
    });

    describe('数据库', function () {
        const ObjectID = require('mongodb').ObjectID,
            dbModels = require('../server/db/models');
        var createObjectIdStub;
        before(function () {
            mongoose.Promise = global.Promise;
        });

        beforeEach(function (done) {
            createObjectIdStub = sinon.stub();
            stubs['@finelets/hyper-rest/db/mongoDb/CreateObjectId'] = createObjectIdStub;
            clearDB(done);
        });

        it('test', function () {
            expect(1).eqls(1);
        })
    });
});