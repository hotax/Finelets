const orderStatusConstants = require('./sales/db/models/SalesOrderStatus'),
    _ = require('underscore');

const __stateGraph = {
    initialState: "Draft",
    states: {
        Draft: {
            toReview: 'Review',
            toCancel: 'Cancel'
        },
        Review: {
            finishReview: {
                choiceBy: "isReviewsFinished",
                options: {
                    no: 'Review',
                    passed: 'Passed',
                    refused: 'Draft'
                }
            }
        },
        Passed: {
            toPublish: 'Running'
        },
        Running: {
            clear: 'Cleared'
        }
    },
    create: function (toState, orderId) {
        return __orderMgr.create(orderId, stateMap[toState]);
    },
    get: function (orderId) {
        return __orderMgr.get(orderId)
            .then(function (data) {
                var state = _.findKey(stateMap, function (v) {
                    return v === data;
                });
                return state;
            })
    },
    update: function (fromState, toState, orderId) {
        return __orderMgr.update(orderId, stateMap[fromState], stateMap[toState]);
    },
    isReviewsFinished: function (orderId, review) {
        return __orderMgr.isReviewsFinished(orderId, review);
    }
};

const stateMap = {
    Draft: orderStatusConstants.statusValues.DRAFT,
    Review: orderStatusConstants.statusValues.LOCKED,
    Passed: orderStatusConstants.statusValues.PASSED,
    Running: orderStatusConstants.statusValues.RUNNING,
    Cancel: orderStatusConstants.statusValues.CANCEL,
    Cleared: orderStatusConstants.statusValues.CLEARED
};
var __orderMgr;
var __stateMachine;

module.exports = function (stateMachineFactory, orderMgr) {
    __stateMachine = stateMachineFactory(__stateGraph);
    __orderMgr = orderMgr;
    return {
        init: function (orderId) {
            return __stateMachine.init(orderId);
        },
        handle: function (orderId, msg, msgData) {
            return __stateMachine.handle(msg, orderId, msgData)
                .then(function (data) {
                    var state = stateMap[data];
                    return state ? state : data;
                })
        }
    }
};
