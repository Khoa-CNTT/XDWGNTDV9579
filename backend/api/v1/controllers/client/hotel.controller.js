const Hotel = require("../../models/hotel.model");
const Room = require("../../models/room.model");

// [GET]/api/v1/hotels
module.exports.index = async (req, res) => {
    const hotels = await Hotel.find({
        status: 'active',
        deleted: false
    });
    res.json(hotels);
};

// [GET]/api/v1/hotels/:hotelId
module.exports.detailHotel = async (req, res) => {
    const hotelId = req.params.hotelId;
    const hotel = await Hotel.findOne({
        _id: hotelId,
        deleted: false
    });

    const rooms = await Room.find({
        hotel_id: hotelId
    });
    res.json({
        code: 200,
        hotel: hotel,
        rooms: rooms
    });
};

// [GET]/api/v1/hotels/:hotelId/:roomId
module.exports.detailRoom = async (req, res) => {
    const hotelId = req.params.hotelId;
    const roomId = req.params.roomId;

    const room = await Room.findOne({
        _id: roomId,
        hotel_id: hotelId
    });
    res.json({
        code: 200,
        room: room
    });
};