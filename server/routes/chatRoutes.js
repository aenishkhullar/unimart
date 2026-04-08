import express from "express";
import {
    createOrGetConversation,
    getConversations,
    getMessages,
    sendMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getConversations);
router.route("/:productId").post(protect, createOrGetConversation);
router.route("/:id/messages").get(protect, getMessages);
router.route("/:id/message").post(protect, sendMessage);

export default router;
