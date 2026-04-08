import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Product from "../models/Product.js";

// @desc    Create or get conversation
// @route   POST /api/chat/:productId
// @access  Private
export const createOrGetConversation = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.user.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot message yourself" });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, product.user] },
            product: product._id,
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, product.user],
                product: product._id,
                lastMessage: ""
            });
        }

        res.status(200).json(conversation);
    } catch (error) {
        console.error("CHAT ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all user's conversations
// @route   GET /api/chat
// @access  Private
export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({ participants: userId })
            .populate("participants", "name")
            .populate("product", "title images")
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        console.error("CHAT ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get conversation messages
// @route   GET /api/chat/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ message: "Not authorized to view this conversation" });
        }

        const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("CHAT ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Send a message
// @route   POST /api/chat/:id/message
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const senderId = req.user._id;
        const { text } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (!conversation.participants.includes(senderId)) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text,
        });

        conversation.lastMessage = text;
        await conversation.save();

        res.status(201).json(message);
    } catch (error) {
        console.error("CHAT ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
