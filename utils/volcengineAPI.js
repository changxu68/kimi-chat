const OpenAI = require('openai');

class VolcengineAPI {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.ARK_API_KEY,
            baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
        });
        
        this.conversations = new Map();
    }

    async initializeTeacherChat(userId) {
        const initialMessages = [
            {
                "role": "system",
                "content": "我是一个老师，现在你是助教老师，帮我一起备课。你需要先询问我是什么课程的老师，然后再问我是教什么内容的，再问我是什么学科有什么需求，然后来给到我备课思路。"
            },
            {
                "role": "assistant",
                "content": "您好！我是您的助教。请问您是什么课程的老师呢？"
            }
        ];

        this.conversations.set(userId, initialMessages);
        return initialMessages[1].content;
    }

    async chatCompletion(message, userId) {
        try {
            let messages = this.conversations.get(userId) || [
                {
                    "role": "system",
                    "content": "我是一个老师，现在你是助教老师，帮我一起备课。你需要先询问我是什么课程的老师，然后再问我是教什么内容的，再问我是什么学科有什么需求，然后来给到我备课思路。"
                }
            ];

            messages.push({ "role": "user", "content": message });

            const completion = await this.client.chat.completions.create({
                model: 'ep-20241214222826-kf88l',
                messages: messages
            });

            const assistantMessage = completion.choices[0].message;
            messages.push(assistantMessage);

            this.conversations.set(userId, messages);

            return assistantMessage.content;
        } catch (error) {
            console.error('Volcengine API Error:', error);
            throw error;
        }
    }
}

module.exports = new VolcengineAPI(); 