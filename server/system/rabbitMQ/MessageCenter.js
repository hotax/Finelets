const amqp = require('amqplib/callback_api'),
    _ = require('underscore');

module.exports = function (config) {
    amqp.connect(config.connectingStr, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var ex = config.name;
            ch.assertExchange(ex, 'direct', {durable: false});
            ch.assertQueue('', {exclusive: true}, function (err, q) {
                _.keys(config.consumers).forEach(function (key) {
                    ch.bindQueue(q.queue, ex, key);
                    ch.consume(q.queue, function (msg) {
                        var data = JSON.parse(msg.content.toString());
                        config.consumers[key](data);
                    }, {noAck: true});
                });
            });
        });
    });
    return {
        publish: function (type, msg) {
            amqp.connect(config.connectingStr, function (err, conn) {
                conn.createChannel(function (err, ch) {
                    var ex = config.name;
                    ch.assertExchange(ex, 'direct', {durable: false});
                    var buff = Buffer.from(JSON.stringify(msg));
                    ch.publish(ex, type, buff);
                });
            });
            return Promise.resolve();
        }
    }
};