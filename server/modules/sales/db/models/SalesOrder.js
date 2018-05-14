const statusValue = require('./SalesOrderStatus');
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Review = require('./Review'),
    transformOption = require("@finelets/hyper-rest/db/mongoDb/DocTransformOption");

const QuantitySchema = new Schema({
    value: Number,
    unit: String
}, transformOption);

const TransportationSchema = new Schema({
    "type": String,
    "dest": String,
    "package": String,
    "label": String
}, transformOption);

const DueSchema = new Schema({
    "type": String,
    "from": Date,
    "to": Date
}, transformOption);

const PriceSchema = new Schema({
    "price": Number,
    "discount": Number,
    "taxRate": Number,
    "fee": Number
}, transformOption);

const OrderItemSchema = new Schema({
    "no": String,
    "product": String,
    "spec": String,
    "qty": QuantitySchema,
    "transportation": TransportationSchema,
    "due": DueSchema,
    "price": PriceSchema
}, transformOption);

const SettlementSchema = new Schema({
    "account": String,
    "taxType": String
}, transformOption);

const SalesOrderSchema = new Schema({
    "orderNo": String,
    "productLine": String,
    "customer": String,
    "settlement": SettlementSchema,
    "items": [OrderItemSchema],
    "reviews": [Review.schemas.Review],
    "sales": String,
    "status": {type: Number, default: statusValue.statusValues.DRAFTING},
    "createDate": {type: Date, default: Date.now, required: true},
    "modifiedDate": {type: Date, default: Date.now, required: true}
},  transformOption);

SalesOrderSchema.virtual('qualityReview').get(function () {
    return this.review && this.review.quality;
});

module.exports = mongoose.model('SalesOrder', SalesOrderSchema);

