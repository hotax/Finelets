const stateMachineFactory = require('../system/StateMachine'),
    salesOrderStates = require('./db/SalesOrderStates'),
    salesOrderReviews = require('./db/SalesOrderReviews'),
    orderLifeCycle = require('./OrderLifeCycle');

const orderLifeCycleHandler = {
    create: function (orderId, state) {
        return salesOrderStates.create(orderId, state);
    },
    get: function (orderId) {
        return salesOrderStates.get(orderId);
    },
    update: function (orderId, fromState, toState) {
        return salesOrderStates.update(orderId, fromState, toState);
    },
    isReviewsFinished: function (orderId, review) {
        return salesOrderReviews.commitReview(orderId, review);
    }
};

module.exports = {
    orderLifeCycle: orderLifeCycle(stateMachineFactory, orderLifeCycleHandler)
};
