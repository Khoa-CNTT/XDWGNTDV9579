const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require("../../models/user.model");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
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

// [POST]/api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
    const email = req.body.email;
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

    const otp = generateHelper.generateRandomNumber(6);

    const objForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    };

    const forgotPassword = new ForgotPassword(objForgotPassword);
    await forgotPassword.save();

    // gửi otp qua email user
    const subject = "Mã OTP để lấy lại mật khẩu";
    const html = `
    Mã OTP để lấy lại mật khẩu của bạn là <b>${otp}</b>.
    Vui lòng không chia sẻ mã OTP này với bất kỳ ai.
    `;

    sendMailHelper.sendMail(email, subject, html);
    res.json({
        code: 200,
        message: "Đã gửi mã OTP qua email"
    });
};

// [POST]/api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });

    if (!result) {
        res.json({
            code: 400,
            message: "Mã OTP không đúng"
        });
        return;
    }

    const user = await User.findOne({
        email: email
    });

    const token = user.token;
    res.cookie("token", token);

    res.json({
        code: 200,
        message: "Xác thực thành công!",
        token: token
    });
};

// [POST]/api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
    const token = req.body.token;
    const password = req.body.password;

    const user = await User.findOne({
        token: token
    });
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        res.json({
            code: 400,
            message: "Mật khẩu đã tồn tại"
        });
        return;
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await User.updateOne({
        token: token
    }, {
        password: hashedPassword
    });

    res.json({
        code: 200,
        message: "Đặt lại mật khẩu thành công"
    });
};

// [GET]/api/v1/users/detail
module.exports.detail = async (req, res) => {
    res.json({
        code: 200,
        message: "Thành công",
        infor: req.user
    });
};

// [PATCH]/api/v1/users/edit
module.exports.edit = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = await User.findByIdAndUpdate({
            _id: userId
        }, req.body, {
            new: true
        });
        res.json({
            code: 200,
            message: "Thành công",
            data: data
        });
    } catch (error) {
        res.json({
            code: 500,
            message: "error: " + error
        });
    }
};

// [GET]/api/v1/user/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.clearCookie("cartId");
    res.json({
        code: 200,
        message: "Đăng xuất thành công"
    });
}