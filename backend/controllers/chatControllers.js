const Chat = require('../models/chatModel')
const User = require('../models/userModel')

const accessChat = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            console.log("UserId not sent with the request")
            return res.status(400).send({
                success: false,
                message: "UserId not sent with the request"
            })
        }
        let chatExists = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ]
        }).populate("users", "-password").populate("latestMessage")

        chatExists = await User.populate(chatExists, {
            path: 'latestMessage.sender',
            select: "name pic email"
        })

        if (chatExists.length > 0) {
            res.status(200).send(chatExists[0])
        } else {
            let chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.user._id, userId]
            }

            let createChat = await Chat.create(chatData)

            let fullChat = await Chat.findOne({
                _id: createChat._id,
            }).populate("users", "-password")

            res.status(200).send(fullChat)
        }

    } catch (error) {
        res.status(401).send({
            success: false,
            message: `Something went wrong, ${error}`
        })
    }
}

const fetchChats = (async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email",
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const createGroupChat = async (req, res) => {
    try {
        if (!req.body.users || !req.body.name) {
            return res.status(400).send({ message: "Please Fill all the feilds" });
        }

        var users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res.status(400).send("More than 2 users are required to form a group chat");
        }

        users.push(req.user);

        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400).send({
            success: false,
            message: error.message
        })
    }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = async (req, res) => {
    try {
        const { chatId, chatName } = req.body
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {
            chatName: chatName
        }, {
            new: true,
        }).populate("users", "-password").populate("groupAdmin", "-password")

        if (!updatedChat) {
            return res.status(400).send({
                success: false,
                message: "Chat not found"
            })
        }
        else {
            return res.status(200).send(updatedChat)
        }

    } catch (error) {
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// @desc    Remove user frrom Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;
  
    // check if the requester is admin
  
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
  };

// @desc    Add user to Group
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;


    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        return res.status(404).send({
            success: false,
            message: "Chat Not Found"
        })
    } else {
        return res.status(200).send(added);
    }
};

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup
}