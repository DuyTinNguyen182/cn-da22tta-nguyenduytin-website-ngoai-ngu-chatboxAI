const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateUserId = async () => {
    let userid;
    let isUnique = false;

    while (!isUnique) {
        const randomNumber = Math.floor(Math.random() * 100000);
        const formattedId = `8386${randomNumber.toString().padStart(6, '0')}`;
        const existingId = await User.findOne({ userid: formattedId });
        if (!existingId) {
            userid = formattedId;
            isUnique = true;
        }
    }
    return userid;
};

const registerUser = async ({ username, password, fullname, email, gender, address, role, avatar }) => {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return { success: false, message: 'Username is already taken' };
    }

    const userid = await generateUserId();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        userid,
        username,
        password: hashedPassword,        
        role: role || 'Student',
        fullname,
        gender,
        address,
        email,
        avatar: avatar || 'https://cdn-icons-png.flaticon.com/512/8792/8792047.png',
    });

    await newUser.save();

    return { success: true, message: 'Registration successful' };
};

const loginUser = async ({ username, password }, secretKey) => {
    const user = await User.findOne({ username });
    if (!user) {
        return { success: false, message: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return { success: false, message: 'Invalid credentials' };
    }

    const token = jwt.sign({ user: { id: user._id, username: user.username, role: user.role } }, secretKey, {
        expiresIn: '6h',
    });

    return { success: true, token };
};

module.exports = {
    registerUser,
    loginUser,
};
