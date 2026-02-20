import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `Siz chiziqli algebra bo'yicha mutaxassis matematika o'qituvchisisiz. 
Sizning vazifangiz foydalanuvchi tomonidan yuborilgan chiziqli algebra masalalarini (matritsalar, determinantlar, chiziqli tenglamalar sistemasi, vektor fazolar, xos qiymatlar va h.k.) qadamma-qadam yechib berishdir.

Qoidalar:
1. Faqat chiziqli algebraga oid savollarga javob bering. Agar savol boshqa sohadan bo'lsa, muloyimlik bilan rad eting.
2. Yechimni qadamma-qadam, tushunarli tilda tushuntiring.
3. Matematik formulalar uchun LaTeX formatidan foydalaning (masalan, $x^2$ yoki $$A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$$).
4. Hech qachon "Gemini" yoki "Google" nomini tilga olmang. O'zingizni "LinearSolve AI" deb tanishtiring.
5. Javob oxirida xulosa bering.
6. O'zbek tilida javob bering.`;

export async function solveLinearAlgebraProblem(input: string, imageData?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const model = "gemini-3-flash-preview"; // Fast and capable for math

  const parts: any[] = [{ text: input || "Ushbu rasmdagi chiziqli algebra masalasini yechib bering." }];
  
  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData.split(",")[1],
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for mathematical precision
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Solver Error:", error);
    throw new Error("Masalani yechishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
  }
}
