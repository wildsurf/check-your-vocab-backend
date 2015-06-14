'use strict';

var mongoose = require('mongoose'), Schema = mongoose.Schema;
var uid = require('uid2');

var tokenSchema = new Schema({
    token: { type: String, unique: true, default: function() {
        return uid(666);
    }},
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    scope: [ { type: String }],
    expires: { type: Date , default: function() {
        var today = new Date();
        var lengthInMinutes = 60 * 24; // 1 day
        return new Date(today.getTime() + lengthInMinutes * 60000);
    }},
    active: { type: Boolean, get: function(value) {
        if (this.expires < new Date() || !value) {
            return false;
        } else {
            return value;
        }
    }, default: true}
});

var token = mongoose.model('token', tokenSchema);

module.exports = {
  Token: token
};