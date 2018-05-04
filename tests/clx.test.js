const proxyquire = require('proxyquire'),
    mongoose = require('mongoose'),
    dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Application', function () {
    var func, stubs, err, reason, createReasonStub;
    before(function () {
        mongoose.Promise = global.Promise;
    });

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
            })
        });

        describe('销售数据库', function () {
            var salesDb, dbSchema;
            before(function () {
                dbSchema = require('../server/modules/sales/db/DbSchema');
            });

            beforeEach(function () {
                salesDb = require('../server/modules/sales/db/SalesDb');
            });

            describe('新增订单', function () {
                var orderData, order, dbSaverStub;
                it('成功', function () {
                    orderData = {orderData: 'any data of order'};
                    order = {order: 'order data from db'};
                    dbSaverStub = sinon.stub();
                    dbSaverStub.withArgs(dbSchema.SalesOrder, orderData).returns(Promise.resolve(order));
                    stubs['@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'] = dbSaverStub;
                    salesDb = proxyquire('../server/modules/sales/db/SalesDb', stubs);
                    return salesDb.createOrder(orderData)
                        .then(function (data) {
                            expect(data).eqls(order);
                        })
                })
            });

            describe('列出未锁定的订单草稿', function () {
                beforeEach(function (done) {
                    clearDB(done);
                });

                it('无任何记录', function () {
                    return salesDb.listUnlockedDraftOrders()
                        .then(function (data) {
                            expect(data).eqls([]);
                        })
                })
            });
        });
    });

    xdescribe('数据库', function () {
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

        describe('销售数据库', function () {
            describe('新增订单', function () {
                xit('test', function () {
                    expect(1).eqls(1);
                })
            });
        });
    });
});