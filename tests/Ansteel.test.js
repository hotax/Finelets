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
        reason = {reason: 'any reason representing any error'};
        createReasonStub = sinon.stub();
        stubs['@finelets/hyper-rest/app'] = {createErrorReason: createReasonStub};
    });

    describe('有限状态机', function () {
        var stateMachine, graph, fromState, toState, stateObject;
        var msg, arg1, arg2;
        beforeEach(function () {
            arg1 = 'arg1';
            arg2 = 'arg2';
            msg = 'message';
            stateObject = {stateObject: 'any data of state object'};
            graph = {
                states:{
                },
                create: sinon.stub(),
                get: sinon.stub(),
                update: sinon.stub()
            };
            stateMachine = require('../server/system/StateMachine')(graph);
        });

        /*it('状态迁移图中未定义create创建状态方法', function () {
            stateMachine = require('../server/system/StateMachine')({});
            return stateMachine.init()
                .then(function (data) {
                    throw 'test failed';
                })
                .catch(function (e) {
                    expect(e.message).eqls('A create method is missed in state graph');
                })
        });

        it('状态迁移图中定义的create不是一个Function', function () {
            stateMachine = require('../server/system/StateMachine')({create: 'I am not a function'});
            return stateMachine.init()
                .then(function () {
                    throw 'test failed';
                })
                .catch(function (e) {
                    expect(e.message).eqls('The create is not a function');
                })
        });*/

        it('默认初始化状态为Initialized', function () {
            toState = 'Initialized';
            graph.create.withArgs(toState, arg1, arg2).returns(Promise.resolve(stateObject));
            return stateMachine.init(arg1, arg2)
                .then(function (data) {
                    expect(data).eqls(stateObject);
                })
        });

        it('定义初始化状态', function () {
            toState = 'foo';
            graph.initialState = toState;
            graph.create.withArgs(toState).returns(Promise.resolve(stateObject));
            return stateMachine.init()
                .then(function (data) {
                    expect(data).eqls(stateObject);
                })
        });

        it('未定义当前状态的迁移路线时略过处理', function () {
            fromState = 'foo';
            graph.update = sinon.spy();
            graph.get.withArgs(arg1).returns(Promise.resolve(fromState));
            return stateMachine.handle(msg, arg1)
                .then(function (state) {
                    expect(state).eqls(fromState);
                    expect(graph.update.notCalled).true;
                })
        });

        it('当前状态下无指定消息的迁移路线时略过处理', function () {
            fromState = 'foo';
            graph.states[fromState] = {};
            graph.update = sinon.spy();
            graph.get.withArgs(arg1).returns(Promise.resolve(fromState));
            return stateMachine.handle(msg, arg1)
                .then(function (state) {
                    expect(state).eqls(fromState);
                    expect(graph.update.notCalled).true;
                })
        });

        it('当前状态下发生特定状态迁移', function () {
            fromState = 'foo';
            toState = 'fee';
            graph.states[fromState] = {message: toState};
            graph.update.withArgs(fromState, toState, arg1).returns(Promise.resolve(stateObject));
            graph.get.withArgs(arg1).returns(Promise.resolve(fromState));
            return stateMachine.handle(msg, arg1)
                .then(function (state) {
                    expect(state).eqls(stateObject);
                    expect(graph.update.calledOnce).true;
                })
        });

        it('当前状态下发生条件状态迁移', function () {
            fromState = 'foo';
            toState = 'fff';
            graph.choice = sinon.stub();
            graph.choice.withArgs(arg1).returns(Promise.resolve('fuu'));
            graph.states[fromState] = {
                message: {
                    choiceBy: "choice",
                    options: {
                        fee: 'Review',
                        fuu: toState
                    }
                }
            };
            graph.update.withArgs(fromState, toState, arg1).returns(Promise.resolve(stateObject));
            graph.get.withArgs(arg1).returns(Promise.resolve(fromState));
            return stateMachine.handle(msg, arg1)
                .then(function (state) {
                    expect(state).eqls(stateObject);
                    expect(graph.update.calledOnce).true;
                })
        });

        it('当前状态下发生条件状态迁移，但目标状态与当前状态相同时，则无需更新', function () {
            fromState = 'foo';
            graph.choice = sinon.stub();
            graph.choice.withArgs(arg1).returns(Promise.resolve('fuu'));
            graph.states[fromState] = {
                message: {
                    choiceBy: "choice",
                    options: {
                        fee: 'Review',
                        fuu: fromState
                    }
                }
            };
            graph.get.withArgs(arg1).returns(Promise.resolve(fromState));
            return stateMachine.handle(msg, arg1)
                .then(function (state) {
                    expect(state).eqls(fromState);
                    expect(graph.update.notCalled).true;
                })
        });
    });

    describe('订单生命周期', function () {
        var orderLifeCycle, stateMachineFactory;
        var orderStatusMock, orderStatusConstants;
        var orderId, orderState;
        beforeEach(function () {
            stateMachineFactory = require('../server/system/StateMachine');
            orderStatusConstants = require('../server/modules/sales/db/models/SalesOrderStatus');
            orderId = "foo";
            orderState = {orderState: 'any data of order state object'};
            orderStatusMock = {
                create: sinon.stub(),
                get: sinon.stub(),
                update: sinon.stub(),
                isReviewsFinished: sinon.stub()
            };
            orderLifeCycle = require('../server/modules/OrderLifeCycle')(stateMachineFactory, orderStatusMock);
        });

        it('初始化，进入草稿状态', function () {
            orderStatusMock.create.withArgs(orderId, orderStatusConstants.statusValues.DRAFT)
                .returns(Promise.resolve(orderState));
            return orderLifeCycle.init(orderId)
                .then(function (data) {
                    expect(data).eqls(orderState);
                })
        });

        describe('各状态下的状态迁移', function () {
            const testTransitions = function (fromOrderState, msg, toOrderState) {
                orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(fromOrderState));
                orderStatusMock.update.withArgs(orderId, fromOrderState, toOrderState).returns(Promise.resolve(orderState));
                return orderLifeCycle.handle(orderId, msg)
                    .then(function (data) {
                        expect(data).eqls(orderState);
                    })
            };

            it('在草稿状态下收到toReview消息，进入评审状态', function () {
                return testTransitions(orderStatusConstants.statusValues.DRAFT, 'toReview',
                    orderStatusConstants.statusValues.LOCKED);
            });

            it('在草稿状态下收到toCancel消息，进入终止状态', function () {
                return testTransitions(orderStatusConstants.statusValues.DRAFT, 'toCancel',
                    orderStatusConstants.statusValues.CANCEL);
            });

            it('在评审通过的状态下收到toPublish消息，进入执行状态', function () {
                return testTransitions(orderStatusConstants.statusValues.PASSED, 'toPublish',
                    orderStatusConstants.statusValues.RUNNING);
            });

            it('在执行状态下收到clear消息，进入结案状态', function () {
                return testTransitions(orderStatusConstants.statusValues.RUNNING, 'clear',
                    orderStatusConstants.statusValues.CLEARED);
            });
        });

        describe('在评审状态下收到finishReview消息', function () {
            var reviewData;
            const testOnReviewState = function (isFinished, toOrderState) {
                orderStatusMock.isReviewsFinished.withArgs(orderId, reviewData).returns(Promise.resolve(isFinished));
                if (toOrderState !== orderStatusConstants.statusValues.LOCKED){
                    orderStatusMock.update.withArgs(orderId, orderStatusConstants.statusValues.LOCKED, toOrderState)
                        .returns(Promise.resolve(orderState));
                }
                return orderLifeCycle.handle(orderId, 'finishReview', reviewData)
                    .then(function (data) {
                        if(toOrderState !== orderStatusConstants.statusValues.LOCKED)
                            expect(data).eqls(orderState);
                        else expect(data).eqls(orderStatusConstants.statusValues.LOCKED);
                    })
            };
            beforeEach(function () {
                reviewData = {review: 'any data of review'};
                orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.LOCKED));
            });

            it('尚未总体完成评审，保持评审状态', function () {
                return testOnReviewState('no', orderStatusConstants.statusValues.LOCKED);
            });

            it('总体通过评审，进入评审通过状态', function () {
                return testOnReviewState('passed', orderStatusConstants.statusValues.PASSED);
            });

            it('总体未通过评审，进入草稿状态', function () {
                return testOnReviewState('refused', orderStatusConstants.statusValues.DRAFT);
            });
        });

    });

    describe('订单状态库', function () {
        var orderStateMgr, dbModel, stateConst;
        var orderIdInDb;

        beforeEach(function (done) {
            orderStateMgr = require('../server/modules/db/SalesOrderStates');
            dbModel = require('../server/modules/sales/db/DbModels').SalesOrder;
            stateConst = require('../server/modules/sales/db/models/SalesOrderStatus').statusValues;
            clearDB(done)
        });

        describe('创建订单生命周期', function () {
            it('指定订单不存在', function () {
                return orderStateMgr.create('5af8fbb0add2862e58e5243b', stateConst.DRAFT)
                    .then(function () {
                        throw 'test failed'
                    })
                    .catch(function (e) {
                        expect(e.message).eqls('The order does not exist!');
                    })
            });

            it('成功', function () {
                return dbSave(dbModel, {orderNo: '00001'})
                    .then(function (data) {
                        orderIdInDb = data.id;
                        return orderStateMgr.create(orderIdInDb, stateConst.DRAFT);
                    })
                    .then(function (data) {
                        expect(data).eqls(stateConst.DRAFT);
                    })
            })
        });

        describe('查询指定订单生命周期状态', function () {
            it('指定订单不存在', function () {
                return orderStateMgr.get('5af8fbb0add2862e58e5243b')
                    .then(function (state) {
                        expect(state).null;
                    })
            });

            it('成功', function () {
                return dbSave(dbModel, {orderNo: '00001', status:stateConst.RUNNING})
                    .then(function (data) {
                        orderIdInDb = data.id;
                        return orderStateMgr.get(orderIdInDb);
                    })
                    .then(function (state) {
                        expect(state).eqls(stateConst.RUNNING);
                    })
            })
        });

        describe('订单生命周期状态迁移', function () {
            it('指定订单不存在', function () {
                return orderStateMgr.update('5af8fbb0add2862e58e5243b', stateConst.DRAFT, stateConst.LOCKED)
                    .then(function () {
                        throw 'test failed'
                    })
                    .catch(function (e) {
                        expect(e.message).eqls('The order does not exist!');
                    })
            });

            it('当前状态与迁移的起始状态不一致', function () {
                return dbSave(dbModel, {orderNo: '00001', status: stateConst.DRAFTING})
                    .then(function (data) {
                        orderIdInDb = data.id;
                        return orderStateMgr.update(orderIdInDb, stateConst.DRAFT, stateConst.LOCKED);
                    })
                    .then(function (state) {
                        expect(state).eqls(stateConst.DRAFTING)
                    })
            });

            it('成功迁移', function () {
                return dbSave(dbModel, {orderNo: '00001', status: stateConst.DRAFT})
                    .then(function (data) {
                        orderIdInDb = data.id;
                        return orderStateMgr.update(orderIdInDb, stateConst.DRAFT, stateConst.LOCKED);
                    })
                    .then(function (state) {
                        expect(state).eqls(stateConst.LOCKED)
                    })
            })
        });
    })
});