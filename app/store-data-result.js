import Ember from 'ember'

var StoreDataResult = Ember.Object.extend({
    init: function () {
        this.set('errors', Ember.A(this.get('errors')));
    },
    dataKey: null,
    dataKeyText: null,
    errors: null,
    data: null
});

export default StoreDataResult;