const orderLifeCycle = require('../../modules').orderLifeCycle,
    mq = require('./RabbitMQImple'),
    msgCenter = require('./MessageCenter'),
    logger = require('@finelets/hyper-rest/app/Logger');

const mqConfig = {
    name: 'AnSteel',
    connectingStr: process.env.MQ,
    consumers: {
        draftSalesOrder: function (msg) {
            logger.debug('Receive a message: ' + JSON.stringify(msg));
            return orderLifeCycle.init(msg.id);
        }
    }
};

module.exports = msgCenter(mq(mqConfig));

