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
    stateMap: {
        Draft: orderStatusConstants.statusValues.DRAFT,
        Review: orderStatusConstants.statusValues.LOCKED,
        Passed: orderStatusConstants.statusValues.PASSED,
        Running: orderStatusConstants.statusValues.RUNNING
    }
};

var __orderMgr;

module.exports = function (orderMgr) {
    __orderMgr = orderMgr;
    return {
        init: function (orderId) {
            var status = __stateGraph.stateMap[__stateGraph.initialState];
            return orderMgr.create(orderId, status)
                .then(function () {
                    return __stateGraph.initialState;
                })
        },
        handle: function (orderId, msg, msgData) {
            var dest;
            return orderMgr.get(orderId)
                .then(function (data) {
                    var state = _.findKey(__stateGraph.stateMap, function (v) {
                        return v === data;
                    });
                    var sm = __stateGraph.states[state];
                    var status = null;
                    if (sm) {
                        dest = sm[msg];
                        if (dest) {
                            if(_.isObject(dest)){
                                return orderMgr[dest.choiceBy](orderId, msgData)
                                    .then(function (ops) {
                                        dest = dest.options[ops];
                                        if(dest === state){
                                            return
                                        }
                                    })
                            }
                            status = __stateGraph.stateMap[dest];
                        }
                    }
                    return status ? orderMgr.update(orderId, status) : Promise.reject(state);
                })
                .then(function () {
                    return dest;
                })
        }
    }
};
