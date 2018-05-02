module.exports = {
    url: '/sales/orders/draft/:id',
    rests: [
        {
            type: 'read',
            handler: function (req, res) {
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
