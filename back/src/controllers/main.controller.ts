import { Request, Response } from 'express';
import { getHotTopics, getPersonalizedFeed } from '../services/main.service.js'; // 두 함수 임포트

export const mainController = {
    // 1. [R] 핫 토픽 조회: GET /api/main/hot
    async getHotFeed(req: Request, res: Response) {
        try {
            const hotTopics = await getHotTopics();
            
            res.status(200).json({
                message: "Hot topics retrieved successfully.",
                data: hotTopics
            });
        } catch (error) {
            console.error("Hot Feed Controller Error:", error);
            res.status(500).json({ message: "Failed to load hot topics." });
        }
    },

    // 2. [R] 개인화 피드 조회: GET /api/main/personalized
    async getPersonalFeed(req: Request, res: Response) {
        const userId = req.userId; // authMiddleware가 userId를 제공

        if (!userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        try {
            const personalizedFeed = await getPersonalizedFeed(userId);
            
            res.status(200).json({
                message: "Personalized feed retrieved successfully.",
                data: personalizedFeed
            });
        } catch (error) {
            console.error("Personalized Feed Controller Error:", error);
            res.status(500).json({ message: "Failed to load personalized feed." });
        }
    }
};