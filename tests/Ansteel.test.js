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
        var stateMachine, graph, toState;
        beforeEach(function () {
            graph = {
                create: sinon.stub(),
                get: sinon.stub()
            };
            stateMachine = require('../server/system/StateMachine')(graph);
        });

        it('默认初始化状态为Initialized', function () {
            var arg1 = 'arg1';
            var arg2 = 'arg2';
            toState = 'Initialized';
            graph.create.withArgs(toState, arg1, arg2).returns(Promise.resolve(toState));
            return stateMachine.init(arg1, arg2)
                .then(function (data) {
                    expect(data).eqls(toState);
                })
        })

    });

    describe('订单生命周期', function () {
        var orderLifeCycle, messageTypeConstants;
        var orderStatusMock, orderStatusConstants;
        var orderId;
        beforeEach(function () {
            messageTypeConstants = require('../server/MessageTypeConstants');
            orderStatusConstants = require('../server/modules/sales/db/models/SalesOrderStatus');
            orderId = "foo";
            orderStatusMock = {
                create: sinon.stub(),
                get: sinon.stub(),
                update: sinon.stub(),
                isReviewsFinished: sinon.stub()
            };
            orderLifeCycle = require('../server/modules/OrderLifeCycle')(orderStatusMock);
        });

        it('初始化，进入草稿状态', function () {
            orderStatusMock.create.withArgs(orderId, orderStatusConstants.statusValues.DRAFT).returns(Promise.resolve());
            return orderLifeCycle.init(orderId)
                .then(function (data) {
                    expect(data).eqls('Draft');
                })
        });

        describe('各状态下的状态迁移', function () {
            const testTransitions = function (fromOrderState, msg, toState, toOrderState) {
                orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(fromOrderState));
                orderStatusMock.update.withArgs(orderId).returns(Promise.resolve(toOrderState));
                return orderLifeCycle.handle(orderId, msg)
                    .then(function (data) {
                        expect(data).eqls(toState);
                    })
            };

            it('在草稿状态下收到toReview消息，进入评审状态', function () {
                return testTransitions(orderStatusConstants.statusValues.DRAFT, 'toReview',
                    'Review', orderStatusConstants.statusValues.Review);
            });

            it('在草稿状态下收到toCancel消息，进入终止状态', function () {
                return testTransitions(orderStatusConstants.statusValues.DRAFT, 'toCancel',
                    'Cancel', orderStatusConstants.statusValues.CANCEL);
            });

            it('在评审通过的状态下收到toPublish消息，进入执行状态', function () {
                return testTransitions(orderStatusConstants.statusValues.PASSED, 'toPublish',
                    'Running', orderStatusConstants.statusValues.RUNNING);
            });

            it('在执行状态下收到clear消息，进入结案状态', function () {
                return testTransitions(orderStatusConstants.statusValues.RUNNING, 'clear',
                    'Cleared', orderStatusConstants.statusValues.CLEARED);
            });
        });

        describe('在评审状态下收到finishReview消息', function () {
            var reviewData;
            const testOnReviewState = function (isFinished, toState, orderState) {
                orderStatusMock.isReviewsFinished.withArgs(orderId, reviewData).returns(Promise.resolve(isFinished));
                if(orderState) orderStatusMock.update.withArgs(orderId).returns(Promise.resolve(orderState));

                return orderLifeCycle.handle(orderId, 'finishReview', reviewData)
                    .then(function (data) {
                        expect(data).eqls(toState);
                    })
            };
            beforeEach(function () {
                reviewData = {review: 'any data of review'};
                orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.LOCKED));
            });

            it('尚未总体完成评审，保持评审状态', function () {
                return testOnReviewState('no', 'Review');
            });

            it('总体通过评审，进入评审通过状态', function () {
                return testOnReviewState('passed', 'Passed', orderStatusConstants.statusValues.PASSED);
            });

            it('总体未通过评审，进入草稿状态', function () {
                return testOnReviewState('refused', 'Draft', orderStatusConstants.statusValues.DRAFT);
            });
        });

    })
});