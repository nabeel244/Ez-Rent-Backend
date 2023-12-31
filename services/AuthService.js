// services/UserService.js
const User = require('../models/User');
const PasswordResetToken = require('../models/ResetPassword')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const { Error, Op } = require('sequelize');
const crypto = require('crypto');
const { forgotPasswordMail } = require('../utils/EmailService')
const sendSms = require('../utils/SmsService')
const { getUrl } = require('../utils/getFullUrl')

function generateRandomNumber() {
    return Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
}


const register = async (userData) => {

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(userData.email)) {
        throw new Error('invalid email format');
    }
    // Check for Admin Role
    if (userData.role === 'admin') {
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        if (existingAdmin) {
            throw new Error(`Can't register as an admin`)
        }
    }
    // Encrypt user password
    if (!userData.password) {
        throw new Error('password is required');

    }
    if (userData.password != userData.confirm_password) {
        throw new Error('password does not match')
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user record in database
    const newUser = await User.create({
        ...userData,
        password: hashedPassword
    });
    return newUser

};

const sendVerificationCode = async (body) => {

    const user = await User.findOne({ where: { email: body.email } });
    if (user) {
        const verificationCode = generateRandomNumber();
        const text = `${verificationCode} is your verification code, don't share to others.`
        await sendSms(body.number, text)
        await User.update({ verify_code: verificationCode }, { where: { email: body.email } });

    } else {
        throw new Error('user not found')
    }
};
const verifyCode = async (body) => {
    const user = await User.findOne({ where: { email: body.email } });
    if (user) {
        // Check if the provided code matches the one in the database
        if (user.verify_code === body.code) {
            // Codes match, so delete the code from the database
            await User.update({ verify_code: null }, { where: { email: body.email } });

            // Return a success message or perform other success actions
            return { message: 'Verification successful' };
        } else {
            // Codes do not match, handle accordingly
            throw new Error('invalid OTP code');
        }
    } else {
        throw new Error('user not found');
    }
};

const login = async (req) => {
    const { email, password } = req.body
    const url = getUrl(req);
    const user = await checkUserRedirection(url, req)

    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
        throw new Error('incorrect password');
    }

    let userForToken = {
        id: user.id,
        email: user.email,
        role: user.role,
        phone: user.phone
    };

    const token = jwt.sign(userForToken, process.env.SECRETKEY, { expiresIn: process.env.EXPIRETIME });
    userForToken.token = token;

    // Return the updated userForToken object
    return userForToken;

}
const checkUserRedirection = async (url, req) => {

    let { email } = req.body;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
        throw new Error('invalid email format');
    }
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
        throw new Error('user not found');
    }

    let role = user.role
    // if (process.env.APP_LESSOR_URL === url && role === 'user') {
    if (process.env.APP_URL === url) {
        return user
    }
    // else if (process.env.APP_VENDOR_URL === url && (role === 'vendor' || 'admin')) {
    else if (process.env.APP_LESSOR_URL === url && (role === 'admin')) {
        return user
    }
    throw new Error('user not found');

}

const forgotPassword = async (req) => {
    const url = getUrl(req);
    const user = await checkUserRedirection(url, req)

    const resetToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 hour

    // Find or create a reset token
    const [resetTokenRecord, created] = await PasswordResetToken.findOrCreate({
        where: { userId: user.id },
        defaults: {
            token: resetToken,
            expiresAt: tokenExpiry
        }
    });

    if (!created) {
        // If the record already exists, update it
        resetTokenRecord.token = resetToken;
        resetTokenRecord.expiresAt = tokenExpiry;
        await resetTokenRecord.save();
    }
    let resetUrl = user.role == 'lessee' ? `${process.env.APP_URL}/resetPassword?user_id=${user.id}&token=${resetToken}`
        : `${process.env.APP_LESSOR_URL}/resetPassword?user_id=${user.id}&token=${resetToken}`

    const mailOptions = {
        from: process.env.TRANSPORTER_USER,
        to: user.email,
        subject: 'Password Reset',
        html: `
    <p>To reset your password, please click the button below:</p>
    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
  `
    };

    await forgotPasswordMail(mailOptions);
};
const resetPassword = async (body) => {
    // Find the password reset token record
    const { token, password, user_id, confirm_password } = body
    const resetTokenRecord = await PasswordResetToken.findOne({
        where: {
            token: token,
            userId: user_id,
            expiresAt: {
                [Op.gt]: new Date() // Checks if the token has not expired
            }
        }
    });

    if (!resetTokenRecord) {
        throw new Error('invalid or expired password reset token');
    }
    if (!password) {
        throw new Error('password is required');

    }
    if (password != confirm_password) {
        throw new Error('password does not match')
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    const user = await User.findOne({ where: { id: resetTokenRecord.userId } });
    if (!user) {
        throw new Error('user not found');
    }

    user.password = hashedPassword;
    await user.save();

    await resetTokenRecord.destroy();
};

//Search user 

const searchUsers = async (searchTerm) => {
    const users = await User.findAll({
        where: {
            [Op.or]: [{
                name: {
                    [Op.like]: `%${searchTerm}%`
                }
            },
            {
                email: {
                    [Op.like]: `%${searchTerm}%`
                }
            },
            {
                phone: {
                    [Op.like]: `%${searchTerm}%`
                }
            }
            ]
        }
    });

    return users;
};



module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    sendVerificationCode,
    verifyCode,
    searchUsers,
    checkUserRedirection
};