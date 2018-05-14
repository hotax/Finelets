const dbModel = require('../sales/db/DbModels'),
    reviewTypeConst = require('../sales/db/models/SalesOrderStatus').reviewType,
    _ = require('underscore'),
    logger = require('@finelets/hyper-rest/app/Logger');

const __addToLastReview = function (lastReview, review) {
    lastReview.details.push(new dbModel.Review.ReviewDetail(review));
    var types = _.values(reviewTypeConst);
    var all = true;
    var passed = true;
    for (var i = 0; i < types.length; i++) {
        var found = _.find(lastReview.details, function (detail) {
            return detail.type === types[i];
        });
        if (!found) {
            all = false;
            break;
        }
        if (!found.pass) {
            passed = false;
            break;
        }
    }
    if (all) {
        lastReview.pass = passed;
    }
};

module.exports = {
    commitReview: function (orderId, review) {
        return dbModel.SalesOrder.findById(orderId)
            .then(function (order) {
                if (!order) {
                    logger.error("The order[id='" + orderId + "'] does not exist!");
                    return Promise.reject(new Error('The order does not exist!'));
                }
                var reviews = order.reviews;
                var lastReview;
                if (reviews.length > 0) {
                    lastReview = reviews[reviews.length - 1];
                    if (_.isUndefined(lastReview.pass)) {
                        __addToLastReview(lastReview, review);
                    } else {
                        lastReview = new dbModel.Review.Review({details: [review]});
                        reviews.push(lastReview);
                    }
                } else {
                    lastReview = new dbModel.Review.Review({details: [review]});
                    reviews.push(lastReview);
                }
                return order.save();
            })
            .then(function (order) {
                var lastReview = order.reviews[order.reviews.length - 1];
                if (lastReview.pass === undefined) return 'no';
                return lastReview.pass ? 'passed' : 'refused';
            })
    }
};