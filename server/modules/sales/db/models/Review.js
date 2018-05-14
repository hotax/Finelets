const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    transformOption = require("@finelets/hyper-rest/db/mongoDb/DocTransformOption");

const ReviewOpinionSchema = new Schema({
    "seq": Number,
    "comment": String
}, transformOption);

const ReviewDetailSchema = new Schema({
    "type": String,
    "pass": Boolean,
    "comment": String,
    "opinions": [ReviewOpinionSchema]
}, transformOption);

const ReviewSchema = new Schema({
    "pass": Boolean,
    "details": [ReviewDetailSchema]
}, transformOption);

module.exports = {
    schemas: {
        Review: ReviewSchema,
        ReviewDetail: ReviewDetailSchema,
        ReviewOpinion: ReviewOpinionSchema
    },
    models: {
        Review: mongoose.model('Review', ReviewSchema),
        ReviewDetail: mongoose.model('ReviewDetail', ReviewDetailSchema),
        ReviewOpinion: mongoose.model('ReviewOpinion', ReviewOpinionSchema)
    }
};