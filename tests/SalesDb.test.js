const proxyquire = require('proxyquire'),
    mongoose = require('mongoose'),
    dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb');

describe('Application', function () {
    var func, stubs, err, reason, createReasonStub;
    before(function () {
        mongoose.Promise = global.Promise;
    });

    beforeEach(function (done) {
        stubs = {};
        err = new Error('any error message');
        reason = {reason: 'any reason representing any error'};
        createReasonStub = sinon.stub();
        stubs['@finelets/hyper-rest/app'] = {createErrorReason: createReasonStub};
        clearDB(done);
    });

    describe('销售子系统', function () {
        describe('销售数据库', function () {
            var salesDb, dbModels;
            before(function () {
                dbModels = require('../server/modules/sales/db/DbModels');
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
                    dbSaverStub.withArgs(dbModels.SalesOrder, orderData).returns(Promise.resolve(order));
                    stubs['@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'] = dbSaverStub;
                    salesDb = proxyquire('../server/modules/sales/db/SalesDb', stubs);
                    return salesDb.createOrder(orderData)
                        .then(function (data) {
                            expect(data).eqls(order);
                        })
                })
            });

            describe('读取指定订单', function () {
                it('指定订单不存在', function () {
                    return salesDb.getOrder('5afa9c45d3f1de28e0048c2d')
                        .then(function (data) {
                            expect(data).null;
                        })
                });

                it('成功', function () {
                    var order;
                    return dbSave(dbModels.SalesOrder, {orderNo: '00001'})
                        .then(function (data) {
                            order = data.toJSON();
                            return salesDb.getOrder(data.id);
                        })
                        .then(function (data) {
                            expect(data).eqls(order);
                        })
                })
            });

            describe('列出未锁定的订单草稿', function () {
                var orderStatus, order;
                beforeEach(function (done) {
                    orderStatus = require('../server/modules/sales/db/models/SalesOrderStatus');
                    order = {productLine: 'foo', status: orderStatus.statusValues.DRAFT};
                    clearDB(done);
                });

                it('无任何记录', function () {
                    return salesDb.listUnlockedDraftOrders()
                        .then(function (data) {
                            expect(data).eqls([]);
                        })
                });

                it('排除已锁定等其他非订单草稿', function () {
                    order.status = order.status | orderStatus.statusValues.LOCKED;
                    return dbSave(dbModels.SalesOrder, order)
                        .then(function () {
                            return salesDb.listUnlockedDraftOrders(['status']);
                        })
                        .then(function (data) {
                            expect(data).eqls([]);
                        })
                });

                it('正常', function () {
                    return dbSave(dbModels.SalesOrder, order)
                        .then(function (data) {
                            order = {id: data.id, status: order.status};
                            return salesDb.listUnlockedDraftOrders(['status']);
                        })
                        .then(function (data) {
                            expect(data).eqls([order]);
                        })
                });
            });
        });
    });
});