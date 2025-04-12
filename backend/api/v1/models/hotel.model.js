const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);
const HotelSchema = new mongoose.Schema({
    name: String,
    description: String,
    images: Array,
    location: {
        city: String,
        country: String,
        address: String
    },
    sold: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: "active"
    },
    slug: {
        type: String,
        slug: "name",
        unique: true
    },
    slug_city: {
        type: String,
        slug: "location.city"
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
const Hotel = mongoose.model('Hotel', HotelSchema, "hotels");
module.exports = Hotel;