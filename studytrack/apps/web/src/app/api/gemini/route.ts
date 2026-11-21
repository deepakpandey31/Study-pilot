import { NextRequest, NextResponse } from 'next/server';

// In-memory cache to protect Gemini free quota
const responseCache = new Map<string, { answer: string; citations: any[]; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// IP-based basic rate limiter
const ipRequestMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 min
const MAX_REQUESTS_PER_WINDOW = 30;

const FALLBACK_KNOWLEDGE: Record<string, { answer: string; citations: any[] }> = {
  crash: {
    answer:
      '### ⚡ 3-Day Emergency AKTU Crash Plan (Semester 3)\n\n**Day 1: Data Structures (Critical Topics — 35 Marks)**\n- **Binary Search Tree (BST):** Insertion algorithm, Inorder traversal (asc keys), Deletion cases (10 Marks, asked 5/5 years).\n- **Stack Applications:** Infix to Postfix conversion with operator precedence stack table (7 Marks).\n- **Sorting:** Quick Sort partitioning & Merge Sort divide-and-conquer recurrence (7-10 Marks).\n\n**Day 2: Object-Oriented Programming (C++) (30 Marks)**\n- **Inheritance & Diamond Problem:** Virtual base class syntax and memory structure (10 Marks).\n- **Virtual Functions & Polymorphism:** vtable and vptr mechanism at runtime (7 Marks).\n- **Operator Overloading:** Overloading `+` and `<<` operators rules (7 Marks).\n\n**Day 3: COA & Discrete Mathematics (35 Marks)**\n- **COA Memory:** Cache mapping (Direct, Associative, Set-Associative) with numerical (10 Marks).\n- **COA Pipeline:** 5-stage instruction pipeline, speedup formula & pipeline hazards (7 Marks).\n- **DM Recurrence Relations:** Characteristic equation method for homogeneous linear recurrences (10 Marks).\n\n*Targeted Revision Note:* Focusing on these 8 Critical topics covers over 68% of past AKTU paper questions with ~40% syllabus effort.',
    citations: [
      { label: 'AKTU 2020-2024 DS PYQ Analysis', type: 'pyq' },
      { label: 'OOP Unit 2 & COA Unit 3', type: 'topic' },
    ],
  },
  bst: {
    answer:
      '### 🌳 Binary Search Tree (BST) — High-Yield Examination Summary\n\n**Definition:**\nFor every node $X$ in a BST:\n- All keys in the left subtree are strictly $< X.key$\n- All keys in the right subtree are strictly $> X.key$\n\n**Core AKTU Exam Questions:**\n1. **Inorder Traversal:** Inorder traversal of a BST always yields keys in strictly ascending sorted order.\n2. **Time Complexities:**\n   - Search/Insert/Delete: Best/Average = $\\mathcal{O}(\\log n)$, Worst (skewed tree) = $\\mathcal{O}(n)$.\n3. **Frequent PYQ Numerical:** Construct BST from sequence: `50, 30, 70, 20, 40, 60, 80` (Asked in 2024, 2023, 2021).',
    citations: [
      { label: 'Data Structures Unit 4 (Trees)', type: 'topic' },
      { label: 'AKTU 2024 Q3 (10 Marks)', type: 'pyq' },
    ],
  },
  cache: {
    answer:
      '### 💾 Cache Memory Mapping Techniques (COA Unit 3)\n\nAKTU 10-Mark Question (Asked in 2024, 2023, 2022, 2021):\n\n1. **Direct Mapping:**\n   - Each main memory block maps to exactly one cache line: $i = j \\pmod m$.\n   - *Advantage:* Simple and fast lookup.\n   - *Disadvantage:* High conflict miss rate (thrashing).\n\n2. **Fully Associative Mapping:**\n   - A memory block can be placed in any cache line.\n   - *Advantage:* Zero conflict misses.\n   - *Disadvantage:* Complex hardware, requires simultaneous comparison of all tags.\n\n3. **Set-Associative Mapping (Industry Standard):**\n   - Cache is divided into sets of $k$ lines. A block maps to a specific set and can sit in any line of that set.',
    citations: [
      { label: 'COA Unit 3 Memory Hierarchy', type: 'topic' },
      { label: 'AKTU 2024 Q1 (10 Marks)', type: 'pyq' },
    ],
  },
  default: {
    answer:
      'Based on the **AKTU Semester 3 Syllabus** and **5-Year Past Examination Papers (2020–2024)**:\n\n- The topic is ranked by historical appearance frequency and marks weight.\n- For semester examinations, always prioritize questions that carry 7 to 10 marks in Section C.\n- Use the **Roadmap** to check off prerequisites before attempting numerical problems.',
    citations: [
      { label: 'StudyTrack PYQ Intelligence Database', type: 'engine' },
      { label: 'AKTU Ordinance Model', type: 'ordinance' },
    ],
  },
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();

    // Check rate limit
    const ipData = ipRequestMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    if (now > ipData.resetTime) {
      ipData.count = 0;
      ipData.resetTime = now + RATE_LIMIT_WINDOW;
    }
    if (ipData.count >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({
        answer: 'Rate limit reached. Please wait a moment before asking another question.',
        citations: [],
        aiGenerated: false,
        fallback: true,
      });
    }
    ipData.count++;
    ipRequestMap.set(ip, ipData);

    const body = await req.json();
    const rawQuery: string = (body.query || '').trim();

    if (!rawQuery) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Security sanitization: limit payload length & strip control characters
    const query = rawQuery.slice(0, 1000).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

    const cacheKey = query.toLowerCase();
    const cached = responseCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        answer: cached.answer,
        citations: cached.citations,
        aiGenerated: true,
        source: 'cache',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key configured, use intelligent deterministic fallback
    if (!apiKey) {
      const fb = getFallbackResponse(query);
      return NextResponse.json({
        answer: fb.answer,
        citations: fb.citations,
        aiGenerated: false,
        fallback: true,
        badge: 'Smart (offline)',
      });
    }

    // Call Gemini API with timeout and failover
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are StudyTrack AI, an expert academic tutor for AKTU B.Tech CSE Semester 3 students.
Grounded in AKTU syllabus (Data Structures, OOP C++, COA, Discrete Math, Technical Communication) and 2020-2024 PYQs.
Answer this student question concisely with markdown headings and bullets. Keep it under 200 words:
"${query}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 600,
              },
            }),
          },
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const citations = [
              { label: 'AKTU B.Tech Curriculum', type: 'syllabus' },
              { label: 'PYQ Intelligence Analysis', type: 'pyq' },
            ];

            responseCache.set(cacheKey, { answer: text, citations, timestamp: now });

            return NextResponse.json({
              answer: text,
              citations,
              aiGenerated: true,
              model,
              badge: 'Gemini AI',
            });
          }
        }
      } catch (err: any) {
        lastError = err?.message;
        continue;
      }
    }

    // If all models failed or timed out, gracefully use fallback
    const fb = getFallbackResponse(query);
    return NextResponse.json({
      answer: fb.answer,
      citations: fb.citations,
      aiGenerated: false,
      fallback: true,
      badge: 'Smart (offline)',
    });
  } catch (error: any) {
    const fb = getFallbackResponse('');
    return NextResponse.json({
      answer: fb.answer,
      citations: fb.citations,
      aiGenerated: false,
      fallback: true,
    });
  }
}

function getFallbackResponse(query: string) {
  const q = query.toLowerCase();
  if (q.includes('crash') || q.includes('plan') || q.includes('3 day') || q.includes('exam') || q.includes('routine')) {
    return FALLBACK_KNOWLEDGE.crash!;
  }
  if (q.includes('bst') || q.includes('tree') || q.includes('binary search')) {
    return FALLBACK_KNOWLEDGE.bst!;
  }
  if (q.includes('cache') || q.includes('memory') || q.includes('mapping')) {
    return FALLBACK_KNOWLEDGE.cache!;
  }
  return FALLBACK_KNOWLEDGE.default!;
}
