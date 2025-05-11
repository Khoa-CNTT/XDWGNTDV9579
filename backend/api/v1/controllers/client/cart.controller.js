const Cart = require("../../models/cart.model");
const Tour = require("../../models/tour.model");
const tourHelper = require("../../helper/tours");
const Hotel = require("../../models/hotel.model");
const Room = require("../../models/room.model");

// [POST] /api/v1/carts/add/:tour_id
module.exports.addPost = async (req, res) => {
    const tourId = req.params.tour_id;
    const { timeDepart, quantity } = req.body;
    const cartId = req.cart.id;

    if (!quantity || quantity <= 0 || new Date(timeDepart) < Date.now()) {
        return res.status(400).json({
            code: 400,
            message: "Số lượng hoặc thời gian khởi hành không hợp lệ"
        });
    }

    const cart = await Cart.findOne({
        _id: cartId
    });
    const tour = await Tour.findOne({ _id: tourId });

    if (!tour) {
        return res.json({
            code: 404,
            message: "Không tìm thấy tour"
        });
    }

    const tourTime = tour.timeStarts.find(item =>
        new Date(item.timeDepart).getTime() === new Date(timeDepart).getTime() &&
        new Date(item.timeDepart) >= Date.now()
    );

    if (!tourTime) {
        return res.json({
            code: 400,
            message: "Thời gian khởi hành không hợp lệ"
        });
    }
    if (quantity > tourTime.stock) {
        return res.json({
            code: 400,
            message: "Số lượng tour vượt quá số lượng còn lại"
        });
    }

    const existTourInCart = cart.tours.find(item => {
        const matchingTime = item.timeStarts.find(t =>
            new Date(t.timeDepart).getTime() === new Date(timeDepart).getTime()
        );
        return item.tour_id.toString() === tourId && matchingTime;
    });

    let updatedCart;

    if (existTourInCart) {
        const existTime = existTourInCart.timeStarts.find(item =>
            new Date(item.timeDepart).getTime() === new Date(timeDepart).getTime());
        const quantityNew = existTime.stock + quantity;

        if (quantityNew > tourTime.stock) {
            return res.json({
                code: 400,
                message: "Số lượng tour trong giỏ hàng vượt quá số lượng tour đang có"
            });
        }

        updatedCart = await Cart.findOneAndUpdate(
            {
                _id: cartId,
                "tours.tour_id": tourId,
                "tours.timeStarts.timeDepart": new Date(timeDepart)
            },
            {
                $set: {
                    "tours.$[tour].timeStarts.$[time].stock": quantityNew
                }
            },
            {
                arrayFilters: [
                    { "tour.tour_id": tourId },
                    { "time.timeDepart": new Date(timeDepart) }
                ],
                new: true
            }
        );

        return res.json({
            code: 200,
            message: "Thêm tour vào giỏ hàng thành công",
            data: updatedCart
        });
    } else {
        const newTourInCart = {
            tour_id: tourId,
            timeStarts: [{ timeDepart: new Date(timeDepart), stock: quantity }]
        };

        updatedCart = await Cart.findOneAndUpdate(
            { _id: cartId },
            { $push: { tours: newTourInCart } },
            { new: true }
        );

        return res.json({
            code: 200,
            message: "Thêm tour vào giỏ hàng thành công",
            data: updatedCart
        });
    }
}

// [POST] /api/v1/carts/add/:hotel_id/:room_id
module.exports.addPostHotel = async (req, res) => {
    const hotelId = req.params.hotel_id;
    const roomId = req.params.room_id;
    const quantity = parseInt(req.body.quantity);
    const cartId = req.cart.id;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({
            code: 400,
            message: "Số lượng không hợp lệ"
        });
    }

    const cart = await Cart.findOne({
        _id: cartId
    });

    const room = await Room.findById(roomId);
    if (!room) {
        return res.json({
            code: 400,
            message: "Phòng không tồn tại"
        });
    }

    const hotelInCart = cart.hotels.find(hotel => hotel.hotel_id === hotelId);

    if (hotelInCart) {
        const roomInHotel = hotelInCart.rooms.find(room => room.room_id === roomId);

        if (!roomInHotel) {
            if (quantity > room.availableRooms) {
                return res.json({
                    code: 400,
                    message: "Số lượng phòng trong giỏ hàng vượt quá số lượng phòng đang trống"
                });
            }

            const data = await Cart.findOneAndUpdate(
                {
                    _id: cartId,
                    "hotels.hotel_id": hotelId,
                    "hotels.rooms.room_id": roomId
                },
                {
                    $set: {
                        "hotels.$[hotel].rooms.$[room].quantity": quantityNew
                    }
                },
                {
                    arrayFilters: [
                        { "hotel.hotel_id": hotelId },
                        { "room.room_id": roomId }
                    ],
                    new: true
                }
            );
            res.json({
                code: 200,
                message: "Thêm giỏ hàng thành công",
                data: data
            });
        } else {
            const quantityNew = quantity + roomInHotel.quantity;
            if (quantityNew > room.availableRooms) {
                return res.json({
                    code: 400,
                    message: "Số lượng phòng trong giỏ hàng vượt quá số lượng phòng đang trống"
                });
            }

            const data = await Cart.findOneAndUpdate(
                {
                    _id: cartId,
                    "hotels.hotel_id": hotelId,
                    "hotels.rooms.room_id": roomId
                },
                {
                    $set: {
                        "hotels.$[hotel].rooms.$[room].quantity": quantityNew
                    }
                },
                {
                    arrayFilters: [
                        { "hotel.hotel_id": hotelId },
                        { "room.room_id": roomId }
                    ],
                    new: true
                }
            );
            res.json({
                code: 200,
                message: "Thêm giỏ hàng thành công",
                data: data
            });
        }

    } else {
        const room = await Room.findById(roomId);
        if (quantity > room.availableRooms) {
            return res.json({
                code: 400,
                message: "Số lượng phòng trong giỏ hàng vượt quá số lượng phòng đang trống"
            });
        }
        const data = await Cart.findOneAndUpdate(
            { _id: cartId },
            {
                $push: {
                    hotels: {
                        hotel_id: hotelId,
                        rooms: [
                            {
                                room_id: roomId,
                                quantity: quantity
                            }
                        ]
                    }
                }
            },
            { new: true }
        );
        res.json({
            code: 200,
            message: "Thêm giỏ hàng thành công",
            data: data
        });
    }
}

// [GET] /api/v1/carts/
module.exports.index = async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
        return res.json({
            code: 400,
            message: "Giỏ hàng không tồn tại"
        });
    }

    const processedCart = {
        _id: cart._id,
        user_id: cart.user_id,
        tours: [],
        hotels: [],
        totalPrice: 0
    };

    // Xử lý tour
    for (const item of cart.tours) {
        const tourInfo = await Tour.findById(item.tour_id).select("-timeStarts");
        if (!tourInfo) continue;

        const priceNew = tourHelper.priceNewTour(tourInfo);
        const tourProcessed = {
            tour_id: item.tour_id,
            tourInfo,
            priceNew,
            timeStarts: []
        };
        for (const timeStart of item.timeStarts) {
            const totalPrice = timeStart.stock * parseInt(priceNew);

            tourProcessed.timeStarts.push({
                timeDepart: timeStart.timeDepart,
                quantity: timeStart.quantity,
                totalPrice: totalPrice
            })
            processedCart.totalPrice += totalPrice;
        }

        if (tourProcessed.timeStarts.length > 0) {
            processedCart.tours.push(tourProcessed);
        }
    }

    // Xử lý hotels & rooms
    for (const hotelItem of cart.hotels) {
        const hotelInfo = await Hotel.findById(hotelItem.hotel_id);
        if (!hotelInfo) continue;

        const hotelProcessed = {
            hotel_id: hotelItem.hotel_id,
            hotelInfo,
            rooms: []
        };

        for (const roomItem of hotelItem.rooms) {
            const roomInfo = await Room.findById(roomItem.room_id);
            if (!roomInfo) continue;

            const total = roomItem.quantity * roomInfo.price;

            hotelProcessed.rooms.push({
                room_id: roomItem.room_id,
                roomInfo,
                quantity: roomItem.quantity,
                price: roomInfo.price,
                totalPrice: total
            });

            processedCart.totalPrice += total;
        }

        if (hotelProcessed.rooms.length > 0) {
            processedCart.hotels.push(hotelProcessed);
        }
    }

    res.json(processedCart);
};

// [PATCH] /api/v1/carts/delete/:tour_id
module.exports.delete = async (req, res) => {
    const cartId = req.cart.id;
    const tourId = req.params.tour_id;

    const data = await Cart.findOneAndUpdate({
        _id: cartId
    }, {
        "$pull": { tours: { "tour_id": tourId } }
    }, { new: true });

    res.json({
        code: 200,
        message: "Xóa tour khỏi giỏ hàng thành công",
        data: data
    });

}

// [PATCH] /api/v1/carts/deleteHotel/:hotel_id/:room_id
module.exports.deleteRoom = async (req, res) => {
    const cartId = req.cart.id;
    const hotelId = req.params.hotel_id;
    const roomId = req.params.room_id;

    const cart = await Cart.findOne({
        _id: cartId,
        "hotels.hotel_id": hotelId,
        "hotels.rooms.room_id": roomId
    });

    if (!cart) {
        return res.json({
            code: 400,
            message: "Giỏ hàng không tồn tại hoặc khách sạn không có trong giỏ hàng"
        });
    }

    const data = await Cart.findOneAndUpdate({
        _id: cartId,
        "hotels.hotel_id": hotelId
    }, {
        "$pull": {
            "hotels.$.rooms": { room_id: roomId }
        }
    }, { new: true });

    const hotelInCart = data.hotels.find(hotel => hotel.hotel_id === hotelId);

    if (hotelInCart && hotelInCart.rooms.length === 0) {
        // Nếu không còn phòng nào thì xóa luôn khách sạn đó
        const finalCart = await Cart.findOneAndUpdate(
            { _id: cartId },
            {
                $pull: {
                    hotels: { hotel_id: hotelId }
                }
            },
            { new: true }
        );
        return res.json({
            code: 200,
            message: "Xóa phòng thành công và khách sạn không còn phòng nên đã xóa luôn khách sạn khỏi giỏ hàng",
            data: finalCart
        });
    }

    res.json({
        code: 200,
        message: "Xóa room khỏi giỏ hàng thành công",
        data: data
    });
}

// [PATCH] /api/v1/carts/deleteHotel/:hotel_id
module.exports.deleteHotel = async (req, res) => {
    const cartId = req.cart.id;
    const hotelId = req.params.hotel_id;

    const cart = await Cart.findOne({
        _id: cartId,
        "hotels.hotel_id": hotelId
    });
    if (!cart) {
        return res.json({
            code: 400,
            message: "Giỏ hàng không tồn tại hoặc khách sạn không có trong giỏ hàng"
        });
    }

    const data = await Cart.findOneAndUpdate({
        _id: cartId
    }, {
        "$pull": { hotels: { "hotel_id": hotelId } }
    }, { new: true });

    res.json({
        code: 200,
        message: "Xóa khách sạn khỏi giỏ hàng thành công",
        data: data
    });
}

// [PATCH] /api/v1/carts/update/:tour_id?timeDepart=?quantity=
module.exports.update = async (req, res) => {
    const tourId = req.params.tour_id;
    const quantity = req.query.quantity;
    const cartId = req.cart.id;
    const timeDepart = new Date(req.query.timeDepart);


    if (!quantity || quantity <= 0 || new Date(timeDepart) < Date.now()) {
        return res.status(400).json({
            code: 400,
            message: "Số lượng hoặc thời gian khởi hành không hợp lệ"
        });
    }

    const cart = await Cart.findOne({
        _id: cartId
    });
    const tour = await Tour.findOne({ _id: tourId });

    if (!tour) {
        return res.json({
            code: 404,
            message: "Không tìm thấy tour"
        });
    }

    const tourTime = tour.timeStarts.find(item =>
        new Date(item.timeDepart).getTime() === new Date(timeDepart).getTime() &&
        new Date(item.timeDepart) >= Date.now()
    );

    if (!tourTime) {
        return res.json({
            code: 400,
            message: "Thời gian khởi hành không hợp lệ"
        });
    }
    if (quantity > tourTime.stock) {
        return res.json({
            code: 400,
            message: "Số lượng tour vượt quá số lượng còn lại"
        });
    }

    const existTourInCart = cart.tours.find(item => {
        const matchingTime = item.timeStarts.find(t =>
            new Date(t.timeDepart).getTime() === new Date(timeDepart).getTime()
        );
        return item.tour_id.toString() === tourId && matchingTime;
    });

    let updatedCart;

    if (existTourInCart) {
        updatedCart = await Cart.findOneAndUpdate(
            {
                _id: cartId,
                "tours.tour_id": tourId,
                "tours.timeStarts.timeDepart": new Date(timeDepart)
            },
            {
                $set: {
                    "tours.$[tour].timeStarts.$[time].stock": quantity
                }
            },
            {
                arrayFilters: [
                    { "tour.tour_id": tourId },
                    { "time.timeDepart": new Date(timeDepart) }
                ],
                new: true
            }
        );

        return res.json({
            code: 200,
            message: "Thêm tour vào giỏ hàng thành công",
            data: updatedCart
        });
    }
}

// [PATCH] /api/v1/carts/updateRoom/:hotel_id/:room_id?quantity=
module.exports.updateRoom = async (req, res) => {
    const cartId = req.cart.id;
    const hotelId = req.params.hotel_id;
    const roomId = req.params.room_id;
    const quantity = parseInt(req.query.quantity);

    const cart = await Cart.findOne({
        _id: cartId,
        "hotels.hotel_id": hotelId,
        "hotels.rooms.room_id": roomId
    });

    if (!cart) {
        return res.json({
            code: 400,
            message: "Giỏ hàng không tồn tại hoặc khách sạn không có trong giỏ hàng"
        });
    }

    const room = await Room.findOne({
        _id: roomId
    });
    if (quantity < 1 || quantity > room.availableRooms) {
        return res.json({
            code: 400,
            message: "Số lượng tour không hợp lệ"
        });
    }

    const data = await Cart.findOneAndUpdate({
        _id: cartId,
        "hotels.hotel_id": hotelId,
        "hotels.rooms.room_id": roomId
    }, {
        $set: {
            "hotels.$[hotel].rooms.$[room].quantity": quantity
        }
    }, {
        arrayFilters: [
            { "hotel.hotel_id": hotelId },
            { "room.room_id": roomId }
        ],
        new: true
    });

    res.json({
        code: 200,
        message: "Cập nhật số lượng giỏ hàng thành công",
        data: data
    });
}