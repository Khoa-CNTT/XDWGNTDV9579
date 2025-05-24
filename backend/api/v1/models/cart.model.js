const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: String,
    tours: [
        {
            tour_id: String,
            timeStarts: [
                {
                    timeDepart: Date,
                    stock: Number,
                }
            ]
        }
    ],
    hotels: [
        {
            hotel_id: String,
            rooms: [
                {
                    room_id: String,
                    quantity: Number,
                    checkIn: Date,
                    checkOut: Date
                }
            ],
        }
    ],
}, {
    timestamps: true
});
const Cart = mongoose.model("Cart", cartSchema, "carts");

module.exports = Cart;