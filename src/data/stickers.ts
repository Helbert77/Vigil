/**
 * Sistema Completo de Figurinhas (Stickers)
 * 
 * Este arquivo contém uma biblioteca de figurinhas organizadas por pacotes temáticos,
 * incluindo suporte para figurinhas animadas e metadados.
 */

// Tipos de dados para figurinhas
export interface StickerData {
  id: string;
  name: string;
  url: string;
  keywords: string[];
  packId: string;
  animated?: boolean;
  width?: number;
  height?: number;
  fileSize?: number;
  format: 'webp' | 'gif' | 'png' | 'svg';
}

export interface StickerPack {
  id: string;
  name: string;
  description: string;
  author: string;
  thumbnail: string;
  category: StickerCategory;
  stickers: StickerData[];
  animated: boolean;
  premium?: boolean;
  downloadCount?: number;
  rating?: number;
  tags: string[];
}

export type StickerCategory = 
  | 'conspiracy'
  | 'emotions'
  | 'animals'
  | 'memes'
  | 'reactions'
  | 'greetings'
  | 'love'
  | 'funny'
  | 'seasonal'
  | 'custom';

// Categorias de figurinhas
export const STICKER_CATEGORIES = [
  {
    id: 'conspiracy' as StickerCategory,
    name: 'Conspiração',
    icon: '👁️',
    description: 'Figurinhas temáticas sobre teorias da conspiração'
  },
  {
    id: 'emotions' as StickerCategory,
    name: 'Emoções',
    icon: '😊',
    description: 'Expressões e sentimentos'
  },
  {
    id: 'animals' as StickerCategory,
    name: 'Animais',
    icon: '🐱',
    description: 'Animais fofos e divertidos'
  },
  {
    id: 'memes' as StickerCategory,
    name: 'Memes',
    icon: '😂',
    description: 'Memes populares e engraçados'
  },
  {
    id: 'reactions' as StickerCategory,
    name: 'Reações',
    icon: '🤔',
    description: 'Reações para conversas'
  },
  {
    id: 'greetings' as StickerCategory,
    name: 'Cumprimentos',
    icon: '👋',
    description: 'Saudações e despedidas'
  },
  {
    id: 'love' as StickerCategory,
    name: 'Amor',
    icon: '❤️',
    description: 'Romance e carinho'
  },
  {
    id: 'funny' as StickerCategory,
    name: 'Engraçado',
    icon: '🤣',
    description: 'Humor e diversão'
  },
  {
    id: 'seasonal' as StickerCategory,
    name: 'Sazonal',
    icon: '🎄',
    description: 'Datas comemorativas e estações'
  },
  {
    id: 'custom' as StickerCategory,
    name: 'Personalizado',
    icon: '⭐',
    description: 'Figurinhas personalizadas'
  }
];

// Base de dados de pacotes de figurinhas
export const STICKER_PACKS: StickerPack[] = [
  // Pacote Conspiração
  {
    id: 'conspiracy-pack-1',
    name: 'Teorias da Conspiração',
    description: 'Figurinhas temáticas sobre mistérios e teorias da conspiração',
    author: 'Vigil Team',
    thumbnail: '/stickers/conspiracy/thumbnail.webp',
    category: 'conspiracy',
    animated: true,
    premium: false,
    downloadCount: 1250,
    rating: 4.8,
    tags: ['conspiração', 'mistério', 'illuminati', 'ovni', 'segredo'],
    stickers: [
      {
        id: 'conspiracy-eye-1',
        name: 'Olho que Tudo Vê',
        url: '/stickers/conspiracy/eye-watching.webp',
        keywords: ['olho', 'vigilância', 'illuminati', 'observando'],
        packId: 'conspiracy-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'conspiracy-ufo-1',
        name: 'UFO Animado',
        url: '/stickers/conspiracy/ufo-flying.gif',
        keywords: ['ovni', 'ufo', 'alienígena', 'voando'],
        packId: 'conspiracy-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'conspiracy-pyramid-1',
        name: 'Pirâmide Illuminati',
        url: '/stickers/conspiracy/pyramid-illuminati.webp',
        keywords: ['pirâmide', 'illuminati', 'triângulo', 'poder'],
        packId: 'conspiracy-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'conspiracy-alien-1',
        name: 'Alienígena Pensativo',
        url: '/stickers/conspiracy/alien-thinking.webp',
        keywords: ['alienígena', 'pensando', 'et', 'reflexão'],
        packId: 'conspiracy-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'conspiracy-secret-1',
        name: 'Documento Secreto',
        url: '/stickers/conspiracy/secret-document.webp',
        keywords: ['documento', 'secreto', 'confidencial', 'arquivo'],
        packId: 'conspiracy-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'conspiracy-antenna-1',
        name: 'Antena Transmitindo',
        url: '/stickers/conspiracy/antenna-signal.gif',
        keywords: ['antena', 'sinal', 'transmissão', 'comunicação'],
        packId: 'conspiracy-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      }
    ]
  },

  // Pacote Emoções
  {
    id: 'emotions-pack-1',
    name: 'Expressões Animadas',
    description: 'Figurinhas expressivas para demonstrar emoções',
    author: 'Emoji Studio',
    thumbnail: '/stickers/emotions/thumbnail.webp',
    category: 'emotions',
    animated: true,
    premium: false,
    downloadCount: 2100,
    rating: 4.9,
    tags: ['emoções', 'expressões', 'sentimentos', 'reações'],
    stickers: [
      {
        id: 'emotion-happy-1',
        name: 'Super Feliz',
        url: '/stickers/emotions/super-happy.gif',
        keywords: ['feliz', 'alegre', 'contente', 'sorrindo'],
        packId: 'emotions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'emotion-love-1',
        name: 'Apaixonado',
        url: '/stickers/emotions/in-love.gif',
        keywords: ['amor', 'apaixonado', 'corações', 'romance'],
        packId: 'emotions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'emotion-surprised-1',
        name: 'Surpreso',
        url: '/stickers/emotions/surprised.webp',
        keywords: ['surpreso', 'chocado', 'impressionado', 'wow'],
        packId: 'emotions-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'emotion-thinking-1',
        name: 'Pensando',
        url: '/stickers/emotions/thinking.gif',
        keywords: ['pensando', 'reflexão', 'dúvida', 'hmm'],
        packId: 'emotions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'emotion-crying-1',
        name: 'Chorando',
        url: '/stickers/emotions/crying.gif',
        keywords: ['chorando', 'triste', 'lágrimas', 'emocionado'],
        packId: 'emotions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'emotion-angry-1',
        name: 'Bravo',
        url: '/stickers/emotions/angry.webp',
        keywords: ['bravo', 'irritado', 'zangado', 'furioso'],
        packId: 'emotions-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      }
    ]
  },

  // Pacote Animais
  {
    id: 'animals-pack-1',
    name: 'Bichinhos Fofos',
    description: 'Animais adoráveis para alegrar suas conversas',
    author: 'Pet Lovers',
    thumbnail: '/stickers/animals/thumbnail.webp',
    category: 'animals',
    animated: true,
    premium: false,
    downloadCount: 1800,
    rating: 4.7,
    tags: ['animais', 'fofos', 'pets', 'adoráveis'],
    stickers: [
      {
        id: 'animal-cat-1',
        name: 'Gato Dormindo',
        url: '/stickers/animals/cat-sleeping.gif',
        keywords: ['gato', 'dormindo', 'fofo', 'soneca'],
        packId: 'animals-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'animal-dog-1',
        name: 'Cachorro Feliz',
        url: '/stickers/animals/dog-happy.gif',
        keywords: ['cachorro', 'feliz', 'animado', 'brincando'],
        packId: 'animals-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'animal-panda-1',
        name: 'Panda Comendo',
        url: '/stickers/animals/panda-eating.webp',
        keywords: ['panda', 'comendo', 'bambu', 'fofo'],
        packId: 'animals-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'animal-rabbit-1',
        name: 'Coelho Saltando',
        url: '/stickers/animals/rabbit-jumping.gif',
        keywords: ['coelho', 'saltando', 'energético', 'fofo'],
        packId: 'animals-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'animal-owl-1',
        name: 'Coruja Sábia',
        url: '/stickers/animals/owl-wise.webp',
        keywords: ['coruja', 'sábia', 'inteligente', 'noturna'],
        packId: 'animals-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'animal-penguin-1',
        name: 'Pinguim Dançando',
        url: '/stickers/animals/penguin-dancing.gif',
        keywords: ['pinguim', 'dançando', 'divertido', 'gelo'],
        packId: 'animals-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      }
    ]
  },

  // Pacote Memes
  {
    id: 'memes-pack-1',
    name: 'Memes Clássicos',
    description: 'Os memes mais populares da internet',
    author: 'Meme Master',
    thumbnail: '/stickers/memes/thumbnail.webp',
    category: 'memes',
    animated: true,
    premium: false,
    downloadCount: 3500,
    rating: 4.9,
    tags: ['memes', 'engraçado', 'viral', 'internet'],
    stickers: [
      {
        id: 'meme-drake-1',
        name: 'Drake Aprovando',
        url: '/stickers/memes/drake-yes.webp',
        keywords: ['drake', 'aprovando', 'sim', 'gostei'],
        packId: 'memes-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'meme-drake-2',
        name: 'Drake Rejeitando',
        url: '/stickers/memes/drake-no.webp',
        keywords: ['drake', 'rejeitando', 'não', 'nope'],
        packId: 'memes-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'meme-stonks-1',
        name: 'Stonks',
        url: '/stickers/memes/stonks.webp',
        keywords: ['stonks', 'investimento', 'lucro', 'negócios'],
        packId: 'memes-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'meme-this-is-fine-1',
        name: 'This is Fine',
        url: '/stickers/memes/this-is-fine.gif',
        keywords: ['this is fine', 'tudo bem', 'caos', 'calma'],
        packId: 'memes-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'meme-distracted-1',
        name: 'Boyfriend Distraído',
        url: '/stickers/memes/distracted-boyfriend.webp',
        keywords: ['distraído', 'namorado', 'escolha', 'tentação'],
        packId: 'memes-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'meme-brain-1',
        name: 'Cérebro Expandindo',
        url: '/stickers/memes/expanding-brain.gif',
        keywords: ['cérebro', 'expandindo', 'inteligência', 'evolução'],
        packId: 'memes-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      }
    ]
  },

  // Pacote Reações
  {
    id: 'reactions-pack-1',
    name: 'Reações Expressivas',
    description: 'Reações perfeitas para qualquer situação',
    author: 'React Studio',
    thumbnail: '/stickers/reactions/thumbnail.webp',
    category: 'reactions',
    animated: true,
    premium: false,
    downloadCount: 2800,
    rating: 4.8,
    tags: ['reações', 'expressões', 'resposta', 'comunicação'],
    stickers: [
      {
        id: 'reaction-thumbs-up-1',
        name: 'Joinha',
        url: '/stickers/reactions/thumbs-up.gif',
        keywords: ['joinha', 'aprovação', 'legal', 'positivo'],
        packId: 'reactions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'reaction-facepalm-1',
        name: 'Facepalm',
        url: '/stickers/reactions/facepalm.gif',
        keywords: ['facepalm', 'decepção', 'erro', 'frustração'],
        packId: 'reactions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'reaction-clap-1',
        name: 'Aplaudindo',
        url: '/stickers/reactions/clapping.gif',
        keywords: ['aplaudindo', 'parabéns', 'aprovação', 'bravo'],
        packId: 'reactions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'reaction-shrug-1',
        name: 'Não Sei',
        url: '/stickers/reactions/shrug.webp',
        keywords: ['não sei', 'tanto faz', 'indiferente', 'sei lá'],
        packId: 'reactions-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'reaction-mind-blown-1',
        name: 'Mente Explodindo',
        url: '/stickers/reactions/mind-blown.gif',
        keywords: ['mente explodindo', 'impressionante', 'wow', 'chocante'],
        packId: 'reactions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'reaction-eye-roll-1',
        name: 'Revirando os Olhos',
        url: '/stickers/reactions/eye-roll.gif',
        keywords: ['revirando olhos', 'sarcasmo', 'irritação', 'óbvio'],
        packId: 'reactions-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      }
    ]
  },

  // Pacote Cumprimentos
  {
    id: 'greetings-pack-1',
    name: 'Olá e Tchau',
    description: 'Cumprimentos calorosos para iniciar e finalizar conversas',
    author: 'Friendly Team',
    thumbnail: '/stickers/greetings/thumbnail.webp',
    category: 'greetings',
    animated: true,
    premium: false,
    downloadCount: 1600,
    rating: 4.6,
    tags: ['cumprimentos', 'olá', 'tchau', 'saudações'],
    stickers: [
      {
        id: 'greeting-hello-1',
        name: 'Olá Animado',
        url: '/stickers/greetings/hello-wave.gif',
        keywords: ['olá', 'oi', 'acenando', 'cumprimento'],
        packId: 'greetings-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'greeting-good-morning-1',
        name: 'Bom Dia',
        url: '/stickers/greetings/good-morning.webp',
        keywords: ['bom dia', 'manhã', 'sol', 'despertar'],
        packId: 'greetings-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'greeting-good-night-1',
        name: 'Boa Noite',
        url: '/stickers/greetings/good-night.gif',
        keywords: ['boa noite', 'dormir', 'lua', 'sonhos'],
        packId: 'greetings-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'greeting-bye-1',
        name: 'Tchau',
        url: '/stickers/greetings/bye-wave.gif',
        keywords: ['tchau', 'adeus', 'até logo', 'despedida'],
        packId: 'greetings-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      },
      {
        id: 'greeting-welcome-1',
        name: 'Bem-vindo',
        url: '/stickers/greetings/welcome.webp',
        keywords: ['bem-vindo', 'boas-vindas', 'recepção', 'chegada'],
        packId: 'greetings-pack-1',
        animated: false,
        format: 'webp',
        width: 512,
        height: 512
      },
      {
        id: 'greeting-high-five-1',
        name: 'High Five',
        url: '/stickers/greetings/high-five.gif',
        keywords: ['high five', 'cumprimento', 'celebração', 'parceria'],
        packId: 'greetings-pack-1',
        animated: true,
        format: 'gif',
        width: 512,
        height: 512
      }
    ]
  }
];

// Funções utilitárias para figurinhas

// Buscar figurinhas
export function searchStickers(query: string, category?: StickerCategory): StickerData[] {
  const searchTerm = query.toLowerCase().trim();
  let allStickers: StickerData[] = [];
  
  // Coletar todas as figurinhas de todos os pacotes
  STICKER_PACKS.forEach(pack => {
    if (!category || pack.category === category) {
      allStickers = allStickers.concat(pack.stickers);
    }
  });
  
  if (!searchTerm) {
    return allStickers;
  }

  return allStickers.filter(sticker => {
    return sticker.name.toLowerCase().includes(searchTerm) ||
           sticker.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm));
  });
}

// Obter pacotes por categoria
export function getStickerPacksByCategory(category: StickerCategory): StickerPack[] {
  return STICKER_PACKS.filter(pack => pack.category === category);
}

// Obter pacote por ID
export function getStickerPackById(packId: string): StickerPack | undefined {
  return STICKER_PACKS.find(pack => pack.id === packId);
}

// Obter figurinha por ID
export function getStickerById(stickerId: string): StickerData | undefined {
  for (const pack of STICKER_PACKS) {
    const sticker = pack.stickers.find(s => s.id === stickerId);
    if (sticker) return sticker;
  }
  return undefined;
}

// Obter pacotes populares
export function getPopularStickerPacks(limit: number = 5): StickerPack[] {
  return STICKER_PACKS
    .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
    .slice(0, limit);
}

// Obter pacotes recentes (simulado)
export function getRecentStickerPacks(): StickerPack[] {
  return STICKER_PACKS.slice(0, 3);
}

// Obter figurinhas favoritas (simulado - em produção viria do localStorage)
export function getFavoriteStickers(): StickerData[] {
  // Em uma implementação real, isso viria do localStorage
  return [
    STICKER_PACKS[0].stickers[0], // Olho que Tudo Vê
    STICKER_PACKS[1].stickers[0], // Super Feliz
    STICKER_PACKS[2].stickers[0], // Gato Dormindo
    STICKER_PACKS[3].stickers[0], // Drake Aprovando
  ];
}

// Obter estatísticas dos pacotes
export function getStickerPackStats() {
  const totalPacks = STICKER_PACKS.length;
  const totalStickers = STICKER_PACKS.reduce((sum, pack) => sum + pack.stickers.length, 0);
  const animatedPacks = STICKER_PACKS.filter(pack => pack.animated).length;
  const premiumPacks = STICKER_PACKS.filter(pack => pack.premium).length;
  
  return {
    totalPacks,
    totalStickers,
    animatedPacks,
    premiumPacks,
    categories: STICKER_CATEGORIES.length
  };
}