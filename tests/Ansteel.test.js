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

        it('在草稿状态下收到toReview消息，进入评审状态', function () {
            orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.DRAFT));
            orderStatusMock.update.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.LOCKED));
            return orderLifeCycle.handle(orderId, 'toReview')
                .then(function (data) {
                    expect(data).eqls('Review');
                })
        });

        it('在评审状态下收到finishReview消息 - 尚未总体完成评审，保持评审状态', function () {
            var reviewData = {review: 'any data of review'};
            orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.LOCKED));
            orderStatusMock.isReviewsFinished.withArgs(orderId, reviewData).returns(Promise.resolve('no'));
            return orderLifeCycle.handle(orderId, 'finishReview', reviewData)
                .then(function (data) {
                    expect(data).eqls('Review');
                })
        });

        it('在评审状态下收到finishReview消息 - 总体通过评审，进入评审通过状态', function () {
            var reviewData = {review: 'any data of review'};
            orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.LOCKED));
            orderStatusMock.isReviewsFinished.withArgs(orderId, reviewData).returns(Promise.resolve('passed'));
            orderStatusMock.update.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.PASSED));

            return orderLifeCycle.handle(orderId, 'finishReview', reviewData)
                .then(function (data) {
                    expect(data).eqls('Passed');
                })
        });

        it('在评审状态下收到finishReview消息 - 总体未通过评审，进入草稿状态', function () {
            var reviewData = {review: 'any data of review'};
            orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.LOCKED));
            orderStatusMock.isReviewsFinished.withArgs(orderId, reviewData).returns(Promise.resolve('refused'));
            orderStatusMock.update.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.DRAFT));

            return orderLifeCycle.handle(orderId, 'finishReview', reviewData)
                .then(function (data) {
                    expect(data).eqls('Draft');
                })
        });

        it('在评审通过的状态下收到toPublish消息，进入执行状态', function () {
            orderStatusMock.get.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.PASSED));
            orderStatusMock.update.withArgs(orderId).returns(Promise.resolve(orderStatusConstants.statusValues.RUNNING));
            return orderLifeCycle.handle(orderId, 'toPublish')
                .then(function (data) {
                    expect(data).eqls('Running');
                })
        });

    })
});