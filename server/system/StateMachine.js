const _ = require('underscore');

const DEFAULT_INIT_STATE = 'Initialized';
module.exports = function (graph) {
    return {
        init: function () {
            var state = graph.initialState ? graph.initialState : DEFAULT_INIT_STATE;
            //if(!graph.create) return Promise.reject(new Error('A create method is missed in state graph'));
            //if(!_.isFunction(graph.create)) return Promise.reject(new Error('The create is not a function'));
            return graph.create.apply(null, [state].concat(Array.from(arguments)))
                .then(function (data) {
                    return data;
                })
        },
        handle: function () {
            var args = Array.from(arguments);
            var msg = args[0];
            args = args.slice(1);
            var dest = null;
            return graph.get.apply(null, args)
                .then(function (state) {
                    if (_.findKey(graph.states, function (obj, k) {
                            return k === state;
                        })) {
                        var trans = graph.states[state];
                        if (_.findKey(trans, function (obj, k) {
                                return k === msg;
                            })) {
                            dest = graph.states[state][msg];
                            if(_.isObject(dest)){
                                return graph[dest.choiceBy].apply(null, args)
                                    .then(function (ops) {
                                        dest = dest.options[ops];
                                        return dest !== state ?
                                            graph.update.apply(null, [state, dest].concat(args)) :
                                            state;
                                    })
                            }
                        }
                    }
                    return dest ? graph.update.apply(null, [state, dest].concat(args)) : state
                })
        }
    }
};