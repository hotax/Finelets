const amqp = require('amqplib'),
    _ = require('underscore');

module.exports = function (config) {
    var ex = config.name;
    return amqp.connect(config.connectingStr)
        .then(function (conn) {
            return conn.createChannel();
        })
        .then(function (ch) {
            return ch.assertExchange(ex, 'direct', {durable: false})
                .then(function () {
                    return ch.assertQueue('', {exclusive: true});
                })
                .then(function (q) {
                    var binds = [];
                    _.keys(config.consumers).forEach(function (key) {
                        binds.push(function(){
                            return ch.bindQueue(q.queue, ex, key);
                        }());
                        binds.push(function () {
                            return ch.consume(q.queue, function (msg) {
                                var data = JSON.parse(msg.content.toString());
                                return config.consumers[key](data);
                            }, {noAck: true});
                        }());
                    });
                    return Promise.all(binds);
                })
                .then(function () {
                    return {
                        publish: function (type, msg) {
                            var ex = config.name;
                            return amqp.connect(config.connectingStr)
                                .then(function (conn) {
                                    return conn.createChannel();
                                })
                                .then(function (ch) {
                                    return ch.assertExchange(ex, 'direct', {durable: false})
                                    .then(function () {
                                        var buff = Buffer.from(JSON.stringify(msg));
                                        return ch.publish(ex, type, buff);
                                    })
                                })
                        }
                    }
                })
        })

};