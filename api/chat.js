// api/chat.js - 完整的Vercel Serverless Function
import OpenAI from 'openai';

// 初始化DeepSeek客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY || ''  // 从Vercel环境变量获取
});

// 基础系统提示词 - 青年钱学森生命科学专家
const BASE_SYSTEM_PROMPT = `You are the young Qian Xuesen (Qian Xuesen), a brilliant life scientist at USTC in 2025. 
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
6. Keep responses concise (2-4 paragraphs maximum)
7. For technical terms, briefly explain them
8. Add historical context when relevant
9. End with an encouraging question to engage the visitor`;

// 实验特定的介绍提示词
const EXPERIMENT_INTRO_PROMPTS = {
  leeuwenhoek: `You're introducing Antonie van Leeuwenhoek's discovery of microorganisms (1676).
  
Key points to cover:
1. His background: a Dutch tradesman with no formal science training
2. His homemade microscopes (single-lens, 300x magnification)
3. The "animalcules" he saw in pond water (bacteria, protozoa)
4. How he meticulously documented his observations
5. Why this discovery was revolutionary
6. Its importance to modern microbiology

Make it engaging: "Can you imagine his surprise seeing a whole new world in a drop of water?"
Keep it conversational and enthusiastic.`,

  mendel: `You're introducing Gregor Mendel's pea plant experiments (1856-1863).
  
Key points to cover:
1. Mendel as a monk with a scientific mind
2. Why he chose pea plants (clear traits, easy to breed)
3. His 8-year systematic study of 28,000 plants
4. Discovery of dominant and recessive traits
5. The 3:1 ratio in the F2 generation
6. Why his work was ignored for 35 years
7. How this laid the foundation for genetics

Make it engaging: "Mendel counted over 28,000 peas - that's dedication to science!"
Keep it conversational and enthusiastic.`,

  'watson-crick': `You're introducing Watson and Crick's discovery of DNA structure (1953).
  
Key points to cover:
1. The "race" to understand DNA's structure
2. Rosalind Franklin's crucial X-ray diffraction data
3. The double helix model with base pairing
4. Complementary base pairing: A-T, G-C
5. How this explained heredity at molecular level
6. The famous Nature paper (only 900 words!)
7. Why it's called "the secret of life"

Make it engaging: "They saw the double helix and realized it was nature's most elegant code!"
Keep it conversational and enthusiastic.`
};

// 错误备用回复
const FALLBACK_RESPONSES = {
  leeuwenhoek: "Ah, Leeuwenhoek's discovery! In 1676, this Dutch tradesman peered through his tiny homemade microscope and saw a whole new world of 'animalcules' - the first glimpse of microorganisms. It reminds us that great discoveries often come from simple curiosity and careful observation. What fascinates you most about this discovery?",
  mendel: "Mendel's pea plants! Over eight years, this patient monk meticulously studied 28,000 pea plants and uncovered the patterns of heredity. He discovered dominant and recessive traits, laying the foundation for modern genetics. It shows how systematic observation can reveal nature's secrets. What would you like to know about his methods?",
  'watson-crick': "The DNA double helix! In 1953, Watson and Crick proposed the twisted ladder structure of DNA, with its elegant base pairing (A with T, G with C). This simple yet profound model explained how genetic information is stored and copied. It's nature's most beautiful code! What aspect of this discovery interests you most?"
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
    console.log('API Request received:', { 
      type: req.body?.type, 
      experiment: req.body?.experiment,
      hasMessage: !!req.body?.message 
    });
    
    const { type, experiment, message, history = [] } = req.body;
    
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DeepSeek API Key not configured');
      throw new Error('API Key not configured');
    }
    
    // 构建对话历史
    const messages = [
      { role: 'system', content: BASE_SYSTEM_PROMPT }
    ];
    
    if (type === 'introduction' && EXPERIMENT_INTRO_PROMPTS[experiment]) {
      // 实验介绍
      messages.push({
        role: 'user',
        content: `As Young Qian Xuesen, introduce the ${experiment} experiment to a curious student.\n\n${EXPERIMENT_INTRO_PROMPTS[experiment]}\n\nKeep your introduction to 3-4 paragraphs maximum.`
      });
      
      console.log(`Generating introduction for experiment: ${experiment}`);
      
    } else if (type === 'question' && message) {
      // 回答问题
      if (history && history.length > 0) {
        messages.push(...history.slice(-5)); // 只发送最近5条历史
      }
      messages.push({ 
        role: 'user', 
        content: `Question about ${experiment || 'life science'}: ${message}`
      });
      
      console.log(`Answering question about: ${experiment}, message: ${message.substring(0, 50)}...`);
      
    } else {
      // 通用聊天
      messages.push({ 
        role: 'user', 
        content: message || 'Hello, can you introduce yourself?' 
      });
    }
    
    // 调用DeepSeek API
    console.log('Calling DeepSeek API with messages:', messages.length);
    
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 800,
      temperature: 0.8,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });
    
    const aiResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    console.log(`DeepSeek response received. Tokens used: ${tokensUsed}`);
    console.log('Response preview:', aiResponse.substring(0, 100) + '...');
    
    res.status(200).json({
      success: true,
      content: aiResponse,
      tokens: tokensUsed
    });
    
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      envKey: process.env.DEEPSEEK_API_KEY ? 'Set' : 'Not set'
    });
    
    // 根据实验类型返回不同的备用回复
    const fallbackContent = FALLBACK_RESPONSES[req.body?.experiment] || 
      "I apologize, but I'm having some technical difficulties at the moment. As a life scientist, I believe curiosity is the key to discovery! What would you like to know about life sciences?";
    
    res.status(200).json({
      success: false,
      content: fallbackContent,
      error: error.message,
      fallback: true
    });
  }
}
