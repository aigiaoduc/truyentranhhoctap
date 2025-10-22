import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { StoryPanel, StoryGenerationResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API key is missing. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getStyleDescription = (style: string): string => {
    switch (style) {
        case 'pixar':
            return "Pixar 3D animation style, cinematic lighting, highly detailed characters with expressive faces, rendered in Octane, high quality.";
        case 'anime':
            return "Japanese anime style, clean lines, large expressive eyes, dynamic action poses, cel shading.";
        case 'watercolor':
            return "Charming watercolor illustration, soft pastel colors, gentle brush strokes, whimsical and dreamy atmosphere.";
        case 'cartoon':
        default:
            return "Digital art, cartoon style for kids, simple background, clear focus on characters and action.";
    }
};

const getColorInstruction = (colorOption: string): string => {
    if (colorOption === 'bw') {
        return "black and white, monochrome, grayscale.";
    }
    return "vibrant colors, full color.";
}

export const generateStoryPrompts = async (
    topic: string,
    content: string,
    characters: string,
    numPrompts: number,
    numQuestions: number,
    comicStyle: string,
    gradeLevel: string,
    colorOption: string,
): Promise<StoryGenerationResult> => {
    try {
        const styleDescription = getStyleDescription(comicStyle);
        const colorInstruction = getColorInstruction(colorOption);

        const prompt = `
        Bạn là một nhà sư phạm tài ba, một người kể chuyện bậc thầy cho trẻ em, và đồng thời là một kỹ sư prompt chuyên nghiệp cho các mô hình AI tạo ảnh. Nhiệm vụ của bạn là tạo ra một kịch bản truyện tranh giáo dục hấp dẫn và đầy đủ.

        Bối cảnh:
        - Cấp độ/Lớp học: ${gradeLevel}
        - Chủ đề bài học: ${topic}
        - Nội dung cụ thể: ${content}
        - Nhân vật chính: ${characters}
        - Tổng số khung truyện: ${numPrompts}
        - Phong cách nghệ thuật: ${styleDescription}
        - Bảng màu: ${colorInstruction}

        Yêu cầu CỰC KỲ QUAN TRỌNG:
        1.  **Phù hợp độ tuổi:** Điều chỉnh ngôn ngữ, độ phức tạp của khái niệm và mạch truyện cho phù hợp với học sinh lớp ${gradeLevel}.
        2.  **Dẫn dắt và giải thích rõ ràng:** Mục tiêu chính là tạo ra một câu chuyện giúp học sinh hiểu bài học một cách DỄ DÀNG và TRỰC QUAN nhất. Hãy sử dụng lời thoại và tình huống để giải thích các khái niệm trong bài học một cách rõ ràng, mạch lạc. Cung cấp câu trả lời và giải thích trực tiếp khi cần thiết để củng cố kiến thức.
        3.  **Mạch truyện mạch lạc:** Tạo một câu chuyện có đầu có cuối, chia thành đúng ${numPrompts} phần (khung truyện), xoay quanh chủ đề bài học.
        4.  **Tạo câu hỏi ôn tập:** Dựa trên nội dung câu chuyện đã tạo, hãy soạn ra chính xác ${numQuestions} câu hỏi (bằng tiếng Việt) để kiểm tra sự hiểu biết của học sinh về bài học. Các câu hỏi này phải liên quan trực tiếp đến các kiến thức được giải thích trong truyện.
        5.  **Định dạng cho mỗi khung truyện:**
            a.  **storyText (văn bản câu chuyện):** Lời tường thuật hoặc lời thoại bằng TIẾNG VIỆT. Phải CỰC KỲ NGẮN GỌN (tối đa 2-3 câu ngắn) để vừa vặn trong một khung truyện tranh.
            b.  **imagePrompt (prompt tạo ảnh):** Một prompt RẤT CHI TIẾT và RÕ RÀNG bằng TIẾNG ANH để tạo hình ảnh. Prompt phải bao gồm: [1] Composition, [2] Subject & Action, [3] Emotion, [4] Environment/Background, [5] Lighting, [6] Art Style, và phải TUÂN THỦ yêu cầu về Bảng màu (${colorInstruction}).

        Định dạng đầu ra:
        Chỉ trả về một đối tượng JSON hợp lệ. Đối tượng này phải chứa hai khóa: 'storyPanels' (một mảng các khung truyện) và 'suggestedQuestions' (một mảng các chuỗi câu hỏi). Không thêm bất kỳ văn bản hay giải thích nào khác ngoài đối tượng JSON.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        storyPanels: {
                            type: Type.ARRAY,
                            description: "Một mảng chứa tất cả các khung truyện.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    panel: {
                                        type: Type.INTEGER,
                                        description: "Số thứ tự của khung truyện, bắt đầu từ 1."
                                    },
                                    storyText: {
                                        type: Type.STRING,
                                        description: "Nội dung câu chuyện hoặc lời thoại bằng tiếng Việt, CỰC KỲ NGẮN GỌN."
                                    },
                                    imagePrompt: {
                                        type: Type.STRING,
                                        description: "Prompt rất chi tiết bằng tiếng Anh để tạo hình ảnh cho khung truyện này."
                                    }
                                },
                                required: ["panel", "storyText", "imagePrompt"]
                            }
                        },
                        suggestedQuestions: {
                            type: Type.ARRAY,
                            description: "Một mảng chứa các câu hỏi ôn tập bằng tiếng Việt.",
                            items: {
                                type: Type.STRING
                            }
                        }
                    },
                    required: ["storyPanels", "suggestedQuestions"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (!result || !Array.isArray(result.storyPanels) || !Array.isArray(result.suggestedQuestions)) {
            throw new Error("Phản hồi từ AI không có cấu trúc hợp lệ.");
        }
        
        // API có thể trả về `storyPanels` là `panels`
        const finalResult = {
            panels: result.storyPanels || result.panels,
            questions: result.suggestedQuestions
        }

        return finalResult as StoryGenerationResult;

    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        throw new Error("Không thể tạo câu chuyện. Vui lòng thử lại sau.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi của AI.");

    } catch (error) {
        console.error("Lỗi khi tạo hình ảnh:", error);
        throw new Error("Không thể tạo hình ảnh. Vui lòng thử lại.");
    }
};
