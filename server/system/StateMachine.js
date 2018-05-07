const DEFAULT_INIT_STATE = 'Initialized';
module.exports = function (graph) {
    return {
        init: function () {
            var state = graph.initialState ? graph.initialState : DEFAULT_INIT_STATE;
            return graph.create.apply(null, [state].concat(Array.from(arguments)))
                .then(function () {
                    return  state;
                })
        }
    }
};