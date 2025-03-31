const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require("../../models/user.model");
const generateHelper = require("../../helpers/generate");
const Cart = require('../../models/cart.model');

// [POST]/api/v1/users/register
module.exports.register = async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const existEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if (existEmail) {
        res.json({
            code: 400,
            message: "Email đã tồn tại"
        })
    } else {
        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: hashedPassword,
            token: generateHelper.generateRandomString(30),
            phone: req.body.phone,
            avatar: req.body.avatar
        });
        user.save();
        const token = user.token;
        res.cookie("token", token);
        res.json({
            code: 200,
            message: "Đăng ký thành công",
            token: token
        })
    }
};

// [POST]/api/v1/users/login
module.exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        res.json({
            code: 400,
            message: "Email không tồn tại"
        });
        return;
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        res.json({
            code: 400,
            message: "Sai mật khẩu!"
        });
        return;
    }
    let cart = await Cart.findOne({
        user_id: user._id
    });
    if (!cart) {
        cart = new Cart({
            user_id: user._id
        });
        await cart.save();
    }
    const token = user.token;
    res.cookie("cartId", cart.id);
    res.cookie("token", token);

    res.json({
        code: 200,
        message: "Đăng nhập thành công",
        token: token,
        cartId: cart.id
    });
};