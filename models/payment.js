const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    paymentMethod: {
        type: String,
        required: true
    },
    paymentDate: {
        type: Date,
        default: ''
    }
});

paymentSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

paymentSchema.set('toJSON', {
    virtuals: true
});


exports.Payment = mongoose.model('Payment', paymentSchema);



