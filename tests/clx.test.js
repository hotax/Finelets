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
        describe('业务逻辑', function () {
            describe('销售人员', function () {
                var sales, orderFactory, messageSendor;
                beforeEach(function () {
                    orderFactory = {
                        create: sinon.stub()
                    };
                    messageSendor = {
                        draftSalesOrder: sinon.spy(),
                        commitDraftSalesOrderToPreview: sinon.spy()
                    };
                    sales = require('../server/modules/sales/Sales')(messageSendor, orderFactory);
                });

                describe('草拟订单', function () {
                    var orderData, order;
                    it('成功', function () {
                        orderData = {orderData: 'any raw data of draft order'};
                        order = {order: 'any data of order raw'};
                        orderFactory.create.withArgs(orderData).returns(Promise.resolve(order));

                        return sales.draftOrder(orderData)
                            .then(function (data) {
                                expect(data).eqls(order);
                                expect(messageSendor.draftSalesOrder).calledOnce;
                                expect(messageSendor.draftSalesOrder).calledWith(order);
                            })
                    });
                });

                describe('订单草稿提交评审', function () {
                    var orders, orderId1, orderId2;
                    it('成功', function () {
                        orderId1 = 'foo';
                        orderId2 = 'fuu';
                        orders = [orderId1, orderId2];
                        return sales.commitDraftOrderToPreview(orders)
                            .then(function () {
                                expect(messageSendor.commitDraftSalesOrderToPreview).calledTwice;
                                expect(messageSendor.commitDraftSalesOrderToPreview).calledWith(orderId1);
                                expect(messageSendor.commitDraftSalesOrderToPreview).calledWith(orderId2);
                            })
                    });
                })
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