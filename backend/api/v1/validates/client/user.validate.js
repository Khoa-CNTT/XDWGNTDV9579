module.exports.registerPost = (req, res, next) => {
    const errors = [];
    if (!req.body.fullName) {
        errors.push('Vui lòng nhập họ tên!');
    }
    if (!req.body.email) {
        errors.push('Vui lòng nhập email!');
    }
    if (!req.body.password) {
        errors.push('Vui lòng nhập mật khẩu!');
    }

    if (!req.body.confirmPassword) {
        errors.push('Vui lòng xác nhận lại mật khẩu!');
    }

    if (req.body.password != req.body.confirmPassword) {
        errors.push('Xác nhận mật khẩu không trùng khớp');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}

module.exports.loginPost = (req, res, next) => {
    const errors = [];
    if (!req.body.email) {
        errors.push('Vui lòng nhập email!');
    }
    if (!req.body.password) {
        errors.push('Vui lòng nhập mật khẩu!');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}


module.exports.forgotPassword = (req, res, next) => {
    const error = [];
    if (!req.body.email) {
        error.push('Vui lòng nhập email!');
    }

    if (error.length > 0) {
        return res.status(400).json({
            success: false,
            error: error
        });
    }
    next();
}

module.exports.resetPasswordPost = (req, res, next) => {
    const errors = [];
    if (!req.body.password) {
        errors.push("Vui lòng nhập mật khẩu!")
    }

    if (!req.body.confirmPassword) {
        errors.push("Vui lòng nhập xác nhận mật khẩu!")
    }

    if (req.body.password != req.body.confirmPassword) {
        errors.push("Xác nhận mật khẩu không trùng khớp!")
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}


module.exports.changePassword = (req, res, next) => {
    if (!req.body.password) {
        req.flash('error', 'Vui lòng nhập mật khẩu!');
        res.redirect("back");
        return;
    }

    if (!req.body.newpassword) {
        req.flash('error', 'Vui lòng mật khẩu mới!');
        res.redirect("back");
        return;
    }

    if (!req.body.confirmNewpassword) {
        req.flash('error', 'Vui lòng xác nhận lại mật khẩu mới!');
        res.redirect("back");
        return;
    }

    if (req.body.newpassword != req.body.confirmNewpassword) {
        req.flash('error', 'Xác nhận mật khẩu mới không trùng khớp');
        res.redirect("back");
        return;
    }
    next();
}