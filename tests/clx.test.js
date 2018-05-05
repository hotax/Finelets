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

    describe('销售子系统', function () {
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
            });
        });

        describe('可提交评审订单草稿线', function () {
            var reviewableLine, db, orders;
            describe('列出可提交评审的订单', function () {
                it('成功', function () {
                    orders = {orders: 'any data of reviewable order from db'};
                    db = {
                        listUnlockedDraftOrders: sinon.stub()
                    };
                    db.listUnlockedDraftOrders.withArgs().returns(Promise.resolve(orders));
                    reviewableLine = require('../server/modules/sales/ReviewableDraftOrdersLine')(db);
                    return reviewableLine.list()
                        .then(function (value) {
                            expect(value).eqls(orders);
                        })
                })
            });
        });
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