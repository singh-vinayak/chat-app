const User = require('../models/userModel')
const generateToken = require('../config/generateToken')

const registerUser = async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400)
        throw new Error("Please enter all the required fields")
    }

    const userExists = await User.findOne({ email: email })
    if (userExists) {
        res.status(400)
        throw new Error("User already exists");
    }

    const user = await User.create({
        name, email, password, pic
    });

    if (user) {
        return res.status(201).send({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400);
        throw new Error("Failed to create user");
    }
}

const authUser = async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({
        email
    })

    if (user && await (user.matchPassword(password))) {
        return res.status(201).send({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        })
    } else {
        return res.status(404).send({
            success: false,
            message: "Wrong Credentials - User not found"
        })
    }
}

const allUsers = async (req, res) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                {
                    name: {
                        $regex: req.query.search, $options: "i"
                    },
                    email: {
                        $regex: req.query.search, $options: "i"
                    }
                }
            ]
        } : {}

        const users = await User.find(keyword).find({
            _id: { $ne: req.user._id }
        })
        res.status(200).json(users)

    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    registerUser,
    authUser,
    allUsers
}