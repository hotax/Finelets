module.exports = {
    Login: {
        "sales": "Sales",
        "quality reviewer": "QualityReviewer",
        "financial reviewer": "FinancialReviewer",
        "transportation reviewer": "TransportationReviewer"
    },
    Sales: {
        "draft": 'DraftOrders',
        "list drafts": "DraftOrders",
        "exit": "Login"
    },
    DraftOrder: {
        "edit": "DraftOrder",
        "cancel": "DraftOrder"
    },
    QualityReviewer: {
        "review": "DraftOrderQualityReviewLine"
    },
    DraftOrderToQualityReview: {
        "review": "DraftOrderToQualityReview"
    },
    FinancialReviewer: {
        "review": "DraftOrderFinancialReviewLine"
    },
    DraftOrderToFinancialReview: {
        "review": "DraftOrderToFinancialReview"
    },
    TransportationReviewer: {
        "review": "DraftOrderTransportationReviewLine"
    },
    DraftOrderToTransportationReview: {
        "review": "DraftOrderToTransportationReview"
    }
};
