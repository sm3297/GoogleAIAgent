import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing in .env file");
}

const ai = new GoogleGenAI({
    apiKey: apiKey,
});

export async function analyzeDifficulty(todoTitle) {
    if (!apiKey) return fallbackAnalyze(todoTitle);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `
사용자의 할 일을 보고 난이도를 "쉬움", "중간", "어려움" 중 하나로 분류해줘.
반드시 "쉬움", "중간", "어려움" 이 세 단어 중 하나만 출력해.

분류 기준과 예시:
- 쉬움: 5~30분 내외로 끝나는 아주 간단한 일 (예: 물 마시기, 쓰레기 버리기, 메일 확인, 전화 한 통)
- 중간: 1~3시간 정도 집중이 필요하거나 루틴한 일 (예: 수학 숙제 하기, 방 청소, 장보기, 독서 30분)
- 어려움: 반나절 이상 걸리거나 복잡한 사고가 필요한 일 (예: 코딩 프로젝트 완성, 시험 공부하기, 발표 자료 만들기, 대청소)

할 일: ${todoTitle}
`,
        });

        const text = response.text?.trim() || "중간";
        console.log(`[Gemini 분석 성공] "${todoTitle}" -> ${text}`);

        if (text.includes("쉬움")) return "쉬움";
        if (text.includes("어려움")) return "어려움";
        return "중간";
    } catch (error) {
        console.warn("Gemini API 실패 - 자체 분석 로직으로 대체합니다.");
        return fallbackAnalyze(todoTitle);
    }
}

// API가 작동하지 않을 때를 대비한 자체 분석 로직
function fallbackAnalyze(title) {
    const hardKeywords = ["프로젝트", "개발", "코딩", "시험", "공부", "발표", "기획", "정리", "대청소", "공모전"];
    const easyKeywords = ["물", "전화", "인사", "메일", "버리기", "사기", "확인", "잠", "휴식"];

    if (hardKeywords.some(key => title.includes(key)) || title.length > 20) {
        console.log(`[자체 분석] "${title}" -> 어려움 (키워드/길이 기반)`);
        return "어려움";
    }
    
    if (easyKeywords.some(key => title.includes(key)) || title.length < 5) {
        console.log(`[자체 분석] "${title}" -> 쉬움 (키워드/길이 기반)`);
        return "쉬움";
    }

    console.log(`[자체 분석] "${title}" -> 중간 (기본값)`);
    return "중간";
}