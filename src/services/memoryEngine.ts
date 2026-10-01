/**
 * Kofi Memory Engine & Permanent Recall Store
 * Manages dual-tier memory:
 * 1. Multi-turn working context (recent dialogue)
 * 2. Permanent long-term memory bank (user identity, preferences, crops, trade history, custom facts)
 *
 * Persists in localStorage and synchronizes with server-side Gemini reasoning.
 */

export interface PermanentMemoryItem {
  id: string;
  category: 'profile' | 'preference' | 'agriculture' | 'fact' | 'note';
  fact: string;
  source: 'user_spoken' | 'ai_inferred' | 'manual';
  timestamp: string;
}

const STORAGE_KEY = 'gharvest_kofi_permanent_memory_v2';

export const INITIAL_MEMORIES: PermanentMemoryItem[] = [
  {
    id: 'mem-user-profile',
    category: 'profile',
    fact: 'User is Kwame Mensah, a bulk food buyer and caterer based in Kumasi, Ghana.',
    source: 'user_spoken',
    timestamp: 'Initial Setup',
  },
  {
    id: 'mem-pref-crop',
    category: 'preference',
    fact: 'Prefers Grade-A Techiman tomatoes, Sunyani plantains, and Ejura dried white maize.',
    source: 'user_spoken',
    timestamp: 'Initial Setup',
  },
  {
    id: 'mem-pref-payment',
    category: 'preference',
    fact: 'Uses MTN Mobile Money (MoMo) escrow for transaction security.',
    source: 'user_spoken',
    timestamp: 'Initial Setup',
  },
  {
    id: 'mem-pref-transport',
    category: 'preference',
    fact: 'Prefers Kia Rhino (3-5 Tonnes) for fast inter-city agricultural haulage to Kumasi.',
    source: 'user_spoken',
    timestamp: 'Initial Setup',
  },
  {
    id: 'mem-market-hub',
    category: 'agriculture',
    fact: 'Regularly trades with verified smallholders around Techiman Central Market and Ejura farms.',
    source: 'ai_inferred',
    timestamp: 'Initial Setup',
  },
];

export class KofiMemoryStore {
  private static cachedMemories: PermanentMemoryItem[] | null = null;

  public static getMemories(): PermanentMemoryItem[] {
    if (typeof window === 'undefined') return INITIAL_MEMORIES;

    if (this.cachedMemories) return this.cachedMemories;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.cachedMemories = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load Kofi memories from localStorage:', e);
    }

    this.cachedMemories = [...INITIAL_MEMORIES];
    this.saveMemories(this.cachedMemories);
    return this.cachedMemories;
  }

  public static saveMemories(memories: PermanentMemoryItem[]): void {
    if (typeof window === 'undefined') return;
    this.cachedMemories = memories;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
      window.dispatchEvent(new CustomEvent('kofi-memory-updated', { detail: memories }));
    } catch (e) {
      console.warn('Failed to save Kofi memories to localStorage:', e);
    }
  }

  public static addMemory(
    fact: string,
    category: PermanentMemoryItem['category'] = 'fact',
    source: PermanentMemoryItem['source'] = 'user_spoken'
  ): PermanentMemoryItem {
    const memories = this.getMemories();
    const cleanFact = fact.trim();

    // Check for duplicate or very similar fact
    const existingIndex = memories.findIndex(
      (m) => m.fact.toLowerCase() === cleanFact.toLowerCase()
    );

    if (existingIndex >= 0) {
      memories[existingIndex].timestamp = new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      this.saveMemories(memories);
      return memories[existingIndex];
    }

    const newMemory: PermanentMemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category,
      fact: cleanFact,
      source,
      timestamp: new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [newMemory, ...memories];
    this.saveMemories(updated);
    return newMemory;
  }

  public static deleteMemory(id: string): void {
    const memories = this.getMemories();
    const updated = memories.filter((m) => m.id !== id);
    this.saveMemories(updated);
  }

  public static resetToDefault(): void {
    this.saveMemories([...INITIAL_MEMORIES]);
  }

  public static clearAll(): void {
    this.saveMemories([]);
  }

  /**
   * Automatically extracts personal details from user speech and commits to memory
   */
  public static extractFromSpeech(text: string): PermanentMemoryItem[] {
    const lower = text.toLowerCase();
    const newItems: PermanentMemoryItem[] = [];

    // 1. Name detection ("My name is Kwame", "I am Kwame")
    const nameMatch = text.match(/\b(?:my name is|i am called|call me|i am)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\b/);
    if (nameMatch && nameMatch[1] && !/kofi|buyer|farmer|here|asking|looking|buying/i.test(nameMatch[1])) {
      newItems.push(
        this.addMemory(`User's name is ${nameMatch[1]}`, 'profile', 'user_spoken')
      );
    }

    // 2. Location detection ("I am based in Kumasi", "I live in Accra", "I operate from Sunyani")
    const locMatch = text.match(/\b(?:i am based in|i live in|i operate from|located in|my shop is in|my farm is in)\s+([A-Za-z\s]+?)(?:\.|\,|$|\sand)/i);
    if (locMatch && locMatch[1]) {
      const town = locMatch[1].trim();
      if (town.length > 2 && town.length < 35) {
        newItems.push(
          this.addMemory(`User is based in/operates from ${town}`, 'profile', 'user_spoken')
        );
      }
    }

    // 3. Phone / MoMo detection
    const momoMatch = text.match(/\b(?:momo|mobile money|phone|number is|contact is)\s*(?:is\s*)?(\+?233\d{9}|0\d{9})\b/i);
    if (momoMatch && momoMatch[1]) {
      newItems.push(
        this.addMemory(`User's Mobile Money/contact number is ${momoMatch[1]}`, 'profile', 'user_spoken')
      );
    }

    // 4. Crop preference ("I prefer Grade A", "I only buy Techiman tomatoes", "I need 100 bags of maize")
    if (/\b(?:i prefer|i always buy|i only buy|my favorite crop is|i love buying)\b/i.test(lower)) {
      newItems.push(
        this.addMemory(`Expressed trade preference: "${text.trim()}"`, 'preference', 'user_spoken')
      );
    }

    // 5. Explicit "Remember that..."
    const rememberMatch = text.match(/\b(?:remember that|don't forget that|keep in mind that|note that)\s+(.+)/i);
    if (rememberMatch && rememberMatch[1]) {
      newItems.push(
        this.addMemory(rememberMatch[1].trim(), 'fact', 'user_spoken')
      );
    }

    return newItems;
  }

  /**
   * Formats memories as plain string bullet points for Gemini prompt injection
   */
  public static getPromptSummary(): string[] {
    return this.getMemories().map((m) => `[${m.category.toUpperCase()}] ${m.fact}`);
  }
}
