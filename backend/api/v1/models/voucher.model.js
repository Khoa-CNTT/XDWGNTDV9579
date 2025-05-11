const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
    title: String,
    code: String,
    description: String,
    quantity: Number,
    discount: Number,
    startDate: Date,
    endDate: Date,
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    "expireAt": { type: Date, expires: 0 }
}, { timestamps: true });

VoucherSchema.pre("save", function (next) {
    this.expireAt = this.endDate;
    next();
});
const Voucher = mongoose.model('Voucher', VoucherSchema, "vouchers");
module.exports = Voucher;