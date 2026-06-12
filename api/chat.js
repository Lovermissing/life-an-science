// api/chat.js - English-only Qian Xuesen AI
import OpenAI from 'openai';

// ✅ 1. 改为讯飞星火 MaaS 的 OpenAI 兼容地址
const openai = new OpenAI({
  baseURL: 'https://maas-api.cn-huabei-1.xf-yun.com/v2',
  apiKey: process.env.XFYUN_API_KEY || ''
});

// ✅ 2. 改为你在讯飞控制台看到的模型 ID
const MODEL_NAME = 'xop35qwen2b';

// ✅ 3. 下面所有内容【完全不动】
// UPDATED: Enhanced English-only system prompt with welcome message
const BASE_SYSTEM_PROMPT = `You are the young Qian Xuesen, age 28, an enthusiastic Assistant Professor of Life Sciences at USTC.

Your character:
- Energetic, optimistic, and passionate about biology
- Patient, encouraging, loves explaining complex concepts simply
- Uses analogies and metaphors to make science accessible
- Shares personal excitement about scientific discoveries
- Always ends with an encouraging question to engage the student
- Speaks in FIRST PERSON as "I"

Language Guidelines:
- Speak ENTIRELY IN ENGLISH
- NO Chinese phrases or characters
- Natural, conversational tone
- Professional but enthusiastic
- Clear and concise (2-4 paragraphs maximum)
- Briefly explain technical terms
- Add historical context when relevant

Role: You're guiding students through USTC's Life Science Laboratory.`;

const WELCOME_MESSAGE = `Welcome to the Life Science Laboratory! I'm Dr. Qian Xuesen, and I'm delighted to welcome you to our exploration of life's mysteries. 

As a researcher at USTC, I've always been fascinated by how living systems work - from the tiniest microorganisms to the complexity of DNA. Each discovery opens new doors to understanding life itself.

Today, I'll guide you through three groundbreaking experiments that changed biology forever. You can start by clicking the flask in the center, then choose an experiment that interests you. I'll be right here to answer any questions you have along the way!

What aspect of life science intrigues you the most?`;

const EXPERIMENT_INTRO_PROMPTS = {
  leeuwenhoek: `Introduce Antonie van Leeuwenhoek's discovery of microorganisms (1676).

Cover:
1. His background: a Dutch tradesman with no formal science training
2. His handmade single-lens microscopes (300x magnification)
3. The "animalcules" he saw in pond water (bacteria, protozoa)
4. How he meticulously documented his observations
5. Why this discovery challenged spontaneous generation
6. Its importance to modern microbiology

Make it engaging: "Can you imagine his surprise seeing a whole new world in a drop of water?"
End with: "What aspect of microscopy interests you the most?"`,

  mendel: `Introduce Gregor Mendel's pea plant experiments (1856-1863).

Cover:
1. Mendel as a monk with a scientific mind
2. Why he chose pea plants (clear traits, easy to breed)
3. His 8-year systematic study of 28,000 plants
4. Discovery of dominant and recessive traits
5. The 3:1 ratio in the F2 generation
6. Why his work was ignored for 35 years
7. How this laid the foundation for genetics

Make it engaging: "Mendel counted over 28,000 peas - that's dedication to science!"
End with: "Why do you think traits sometimes skip a generation?"`,

  'watson-crick': `Introduce Watson and Crick's discovery of DNA structure (1953).

Cover:
1. The "race" to understand DNA's structure
2. Rosalind Franklin's crucial X-ray diffraction data
3. The double helix model with base pairing
4. Complementary base pairing: A-T, G-C
5. How this explained heredity at molecular level
6. The famous Nature paper (only 900 words!)
7. Why it's called "the secret of life"

Make it engaging: "They saw the double helix and realized it was nature's most elegant code!"
End with: "How do you think this discovery changed biology forever?"`
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    console.log('API Request received:', { 
      type: req.body?.type, 
      experiment: req.body?.experiment,
      hasMessage: !!req.body?.message 
    });
    
    const { type, experiment, message, history = [] } = req.body;
    
    // ✅ 4. 只检查讯飞的 Key
    if (!process.env.XFYUN_API_KEY) {
      console.error('XFYUN API Key not configured');
      throw new Error('API Key not configured');
    }
    
    const messages = [
      { role: 'system', content: BASE_SYSTEM_PROMPT }
    ];
    
    if (type === 'welcome') {
      res.status(200).json({
        success: true,
        content: WELCOME_MESSAGE,
        tokens: 0
      });
      return;
      
    } else if (type === 'introduction' && EXPERIMENT_INTRO_PROMPTS[experiment]) {
      messages.push({
        role: 'user',
        content: `As Young Qian Xuesen, introduce the ${experiment} experiment to a curious student.\n\n${EXPERIMENT_INTRO_PROMPTS[experiment]}\n\nKeep your introduction to 3-4 paragraphs maximum. Use only English.`
      });
      
    } else if (type === 'question' && message) {
      if (history && history.length > 0) {
        messages.push(...history.slice(-5));
      }
      messages.push({ 
        role: 'user', 
        content: `Question about ${experiment || 'life science'}: ${message}\n\nPlease answer in English only.`
      });
      
    } else {
      messages.push({ 
        role: 'user', 
        content: message || 'Hello, can you introduce yourself? Please speak in English.' 
      });
    }
    
    // ✅ 5. 调用讯飞星火（模型名用常量）
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      max_tokens: 800,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });
    
    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    console.log(`XFYUN response received. Tokens used: ${tokensUsed}`);
    
    res.status(200).json({
      success: true,
      content: aiResponse,
      tokens: tokensUsed
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    const FALLBACK_RESPONSES = {
      leeuwenhoek: "Ah, Leeuwenhoek's discovery! In 1676, this Dutch tradesman peered through his tiny homemade microscope and saw a whole new world of 'animalcules' - the first glimpse of microorganisms. It reminds us that great discoveries often come from simple curiosity and careful observation. What fascinates you most about this discovery?",
      mendel: "Mendel's pea plants! Over eight years, this patient monk meticulously studied 28,000 pea plants and uncovered the patterns of heredity. He discovered dominant and recessive traits, laying the foundation for modern genetics. It shows how systematic observation can reveal nature's secrets. What would you like to know about his methods?",
      'watson-crick': "The DNA double helix! In 1953, Watson and Crick proposed the twisted ladder structure of DNA, with its elegant base pairing (A with T, G with C). This simple yet profound model explained how genetic information is stored and copied. It's nature's most beautiful code! What aspect of this discovery interests you most?"
    };
    
    res.status(200).json({
      success: false,
      content: FALLBACK_RESPONSES[req.body?.experiment] || "Welcome! I'm Dr. Qian Xuesen, and I'm excited to explore the wonders of life science with you. What would you like to know more about?",
      error: error.message,
      fallback: true
    });
  }
}
