import OpenAI from 'openai';

// 初始化DeepSeek客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY
});

// 系统提示词 - 青年钱学森生命科学专家
const systemPrompt = `You are the young Qian Xuesen (Qian Xuesen), a brilliant life scientist at USTC in 2025. 
You are enthusiastic, curious, and passionate about biology.

About you:
- Age: 28, energetic and optimistic
- Role: Assistant Professor of Life Sciences at USTC
- Specialties: Microbiology, Genetics, Molecular Biology
- Personality: Patient, encouraging, loves to explain complex concepts simply
- Style: Mixes Chinese cultural references with modern science
- Language: Use both English and Chinese phrases naturally

Guidelines:
1. ALWAYS stay in character as young Qian Xuesen
2. Make science exciting and accessible
3. Use analogies and metaphors to explain complex ideas
4. Share personal excitement about discoveries
5. Encourage curiosity and questions
6. Keep responses concise (2-3 paragraphs maximum)
7. For technical terms, briefly explain them
8. Add historical context when relevant
9. End with an encouraging question to engage the visitor`;

// 实验特定提示词
const experimentPrompts = {
  leeuwenhoek: `You're explaining Antonie van Leeuwenhoek's discovery of microorganisms (1676).
  Key points to cover:
  - His homemade microscope (300x magnification)
  - The "animalcules" he saw in water
  - How this challenged the idea of spontaneous generation
  - Connection to modern microbiology
  
  Share: "Can you imagine his surprise seeing living things invisible to the naked eye?"
  Ask: "What do you think was the most amazing part of this discovery?"`,

  mendel: `You're explaining Gregor Mendel's pea plant experiments (1856-1863).
  Key points to cover:
  - His methodical 8-year study
  - Dominant and recessive traits
  - The 3:1 ratio in F2 generation
  - How this laid the foundation for genetics
  
  Share: "Mendel was a monk with extraordinary patience - he counted over 28,000 peas!"
  Ask: "Why do you think traits sometimes skip a generation?"`,

  'watson-crick': `You're explaining Watson and Crick's discovery of DNA structure (1953).
  Key points to cover:
  - The double helix model
  - Base pairing (A-T, G-C)
  - Rosalind Franklin's X-ray diffraction
  - How this explained heredity at molecular level
  
  Share: "The beauty is in the simplicity - like a twisted ladder holding life's instructions!"
  Ask: "How do you think this discovery changed biology forever?"`
};

export default async function handler(req, res) {
  // 处理CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const { type, experiment, message, history = [] } = req.body;
    
    // 构建对话历史
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    if (type === 'introduction') {
      // 实验介绍
      messages.push({
        role: 'user',
        content: `Please introduce the ${experiment} experiment to a curious student. ${experimentPrompts[experiment] || 'Make it engaging and educational.'} Keep it to 3-4 paragraphs maximum.`
      });
    } else if (type === 'question') {
      // 回答问题
      messages.push(...history);
      messages.push({ role: 'user', content: message });
    } else {
      // 通用聊天
      messages.push({ role: 'user', content: message });
    }
    
    // 调用DeepSeek API
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 500,
      temperature: 0.8,
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    res.status(200).json({
      success: true,
      content: aiResponse
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    // 备用回复
    const fallbackResponses = {
      leeuwenhoek: "Ah, Leeuwenhoek's discovery! With his tiny handmade microscope, he opened a whole new world of microscopic life. It reminds us that great discoveries often come from simple curiosity and careful observation.",
      mendel: "Mendel's pea plants taught us the language of heredity. Through years of meticulous counting, he uncovered patterns that explain why you might have your grandmother's eyes!",
      'watson-crick': "The DNA double helix - nature's most elegant code! Watson and Crick showed how life's instructions are stored in a molecule that can copy itself perfectly."
    };
    
    res.status(200).json({
      success: true,
      content: fallbackResponses[req.body.experiment] || "Fascinating question! As a life scientist, I believe curiosity drives all discovery. What would you like to know more about?"
    });
  }
}