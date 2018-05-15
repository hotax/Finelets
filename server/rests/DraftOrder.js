const salesDb = require('../modules/sales/db/SalesDb');

module.exports = {
    url: '/api/sales/orders/draft/:id',
    rests: [
        {
            type: 'read',
            handler: function (req, res) {
                var id = req.params["id"];
                return salesDb.getOrder(id);
            }
        },
        {
            type: 'delete',
            conditional: true,
            handler: {
                condition: function (id, version) {
                },
                handle: function (id, version) {
                }
            }
        }
    ]
};
