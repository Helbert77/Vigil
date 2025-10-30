/**
 * Sistema Completo de Emojis
 * 
 * Este arquivo contém uma biblioteca expandida de emojis organizados por categorias,
 * incluindo suporte para tons de pele, emojis animados e metadados.
 */

// Tipos de dados para emojis
export interface EmojiData {
  emoji: string;
  name: string;
  keywords: string[];
  category: EmojiCategory;
  subcategory?: string;
  skinTones?: string[];
  animated?: boolean;
  unicode: string;
  shortcode: string;
}

export type EmojiCategory = 
  | 'smileys-emotion'
  | 'people-body'
  | 'animals-nature'
  | 'food-drink'
  | 'travel-places'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags'
  | 'conspiracy'
  | 'recent'
  | 'favorites';

export interface EmojiCategoryData {
  id: EmojiCategory;
  name: string;
  icon: string;
  description: string;
}

// Tons de pele disponíveis
export const SKIN_TONES = {
  light: '🏻',
  mediumLight: '🏼',
  medium: '🏽',
  mediumDark: '🏾',
  dark: '🏿'
};

// Categorias de emojis
export const EMOJI_CATEGORIES: EmojiCategoryData[] = [
  {
    id: 'recent',
    name: 'Recentes',
    icon: '🕒',
    description: 'Emojis usados recentemente'
  },
  {
    id: 'favorites',
    name: 'Favoritos',
    icon: '⭐',
    description: 'Seus emojis favoritos'
  },
  {
    id: 'smileys-emotion',
    name: 'Rostos e Emoções',
    icon: '😀',
    description: 'Expressões faciais e emoções'
  },
  {
    id: 'people-body',
    name: 'Pessoas e Corpo',
    icon: '👋',
    description: 'Pessoas, gestos e partes do corpo'
  },
  {
    id: 'animals-nature',
    name: 'Animais e Natureza',
    icon: '🐶',
    description: 'Animais, plantas e natureza'
  },
  {
    id: 'food-drink',
    name: 'Comida e Bebida',
    icon: '🍎',
    description: 'Alimentos e bebidas'
  },
  {
    id: 'travel-places',
    name: 'Viagem e Lugares',
    icon: '✈️',
    description: 'Transportes, lugares e mapas'
  },
  {
    id: 'activities',
    name: 'Atividades',
    icon: '⚽',
    description: 'Esportes, hobbies e atividades'
  },
  {
    id: 'objects',
    name: 'Objetos',
    icon: '💡',
    description: 'Objetos do dia a dia'
  },
  {
    id: 'symbols',
    name: 'Símbolos',
    icon: '❤️',
    description: 'Símbolos e sinais'
  },
  {
    id: 'flags',
    name: 'Bandeiras',
    icon: '🏁',
    description: 'Bandeiras de países e regiões'
  },
  {
    id: 'conspiracy',
    name: 'Conspiração',
    icon: '👁️',
    description: 'Emojis temáticos para teorias da conspiração'
  }
];

// Base de dados expandida de emojis
export const EMOJI_DATABASE: EmojiData[] = [
  // Rostos e Emoções
  {
    emoji: '😀',
    name: 'Rosto Sorridente',
    keywords: ['feliz', 'alegre', 'sorriso', 'contente'],
    category: 'smileys-emotion',
    unicode: 'U+1F600',
    shortcode: ':grinning:'
  },
  {
    emoji: '😃',
    name: 'Rosto Sorridente com Olhos Grandes',
    keywords: ['feliz', 'alegre', 'sorriso', 'animado'],
    category: 'smileys-emotion',
    unicode: 'U+1F603',
    shortcode: ':smiley:'
  },
  {
    emoji: '😄',
    name: 'Rosto Sorridente com Olhos Sorridentes',
    keywords: ['feliz', 'alegre', 'sorriso', 'radiante'],
    category: 'smileys-emotion',
    unicode: 'U+1F604',
    shortcode: ':smile:'
  },
  {
    emoji: '😁',
    name: 'Rosto Radiante com Olhos Sorridentes',
    keywords: ['feliz', 'alegre', 'radiante', 'dentes'],
    category: 'smileys-emotion',
    unicode: 'U+1F601',
    shortcode: ':grin:'
  },
  {
    emoji: '😆',
    name: 'Rosto Sorridente com Olhos Apertados',
    keywords: ['rindo', 'feliz', 'alegre', 'gargalhada'],
    category: 'smileys-emotion',
    unicode: 'U+1F606',
    shortcode: ':laughing:'
  },
  {
    emoji: '😅',
    name: 'Rosto Sorridente com Suor',
    keywords: ['alívio', 'nervoso', 'suor', 'constrangido'],
    category: 'smileys-emotion',
    unicode: 'U+1F605',
    shortcode: ':sweat_smile:'
  },
  {
    emoji: '🤣',
    name: 'Rolando de Rir',
    keywords: ['rindo', 'gargalhada', 'hilário', 'lágrimas'],
    category: 'smileys-emotion',
    unicode: 'U+1F923',
    shortcode: ':rofl:'
  },
  {
    emoji: '😂',
    name: 'Rosto com Lágrimas de Alegria',
    keywords: ['rindo', 'lágrimas', 'alegria', 'hilário'],
    category: 'smileys-emotion',
    unicode: 'U+1F602',
    shortcode: ':joy:'
  },
  {
    emoji: '🙂',
    name: 'Rosto Ligeiramente Sorridente',
    keywords: ['sorriso', 'feliz', 'contente', 'sutil'],
    category: 'smileys-emotion',
    unicode: 'U+1F642',
    shortcode: ':slightly_smiling_face:'
  },
  {
    emoji: '🙃',
    name: 'Rosto de Cabeça para Baixo',
    keywords: ['sarcástico', 'irônico', 'bobo', 'invertido'],
    category: 'smileys-emotion',
    unicode: 'U+1F643',
    shortcode: ':upside_down_face:'
  },
  {
    emoji: '😉',
    name: 'Rosto Piscando',
    keywords: ['piscada', 'flerte', 'brincadeira', 'cumplicidade'],
    category: 'smileys-emotion',
    unicode: 'U+1F609',
    shortcode: ':wink:'
  },
  {
    emoji: '😊',
    name: 'Rosto Sorridente com Olhos Sorridentes',
    keywords: ['feliz', 'contente', 'tímido', 'corado'],
    category: 'smileys-emotion',
    unicode: 'U+1F60A',
    shortcode: ':blush:'
  },
  {
    emoji: '😇',
    name: 'Rosto Sorridente com Auréola',
    keywords: ['anjo', 'inocente', 'santo', 'puro'],
    category: 'smileys-emotion',
    unicode: 'U+1F607',
    shortcode: ':innocent:'
  },
  {
    emoji: '🥰',
    name: 'Rosto Sorridente com Corações',
    keywords: ['amor', 'apaixonado', 'carinho', 'adorável'],
    category: 'smileys-emotion',
    unicode: 'U+1F970',
    shortcode: ':smiling_face_with_hearts:'
  },
  {
    emoji: '😍',
    name: 'Rosto Sorridente com Olhos de Coração',
    keywords: ['amor', 'apaixonado', 'admiração', 'encantado'],
    category: 'smileys-emotion',
    unicode: 'U+1F60D',
    shortcode: ':heart_eyes:'
  },
  {
    emoji: '🤩',
    name: 'Rosto com Olhos de Estrela',
    keywords: ['impressionado', 'admiração', 'estrelas', 'deslumbrado'],
    category: 'smileys-emotion',
    unicode: 'U+1F929',
    shortcode: ':star_struck:'
  },
  {
    emoji: '😘',
    name: 'Rosto Mandando Beijo',
    keywords: ['beijo', 'amor', 'carinho', 'romântico'],
    category: 'smileys-emotion',
    unicode: 'U+1F618',
    shortcode: ':kissing_heart:'
  },
  {
    emoji: '😗',
    name: 'Rosto Beijando',
    keywords: ['beijo', 'carinho', 'amor', 'lábios'],
    category: 'smileys-emotion',
    unicode: 'U+1F617',
    shortcode: ':kissing:'
  },
  {
    emoji: '😚',
    name: 'Rosto Beijando com Olhos Fechados',
    keywords: ['beijo', 'carinho', 'amor', 'olhos fechados'],
    category: 'smileys-emotion',
    unicode: 'U+1F61A',
    shortcode: ':kissing_closed_eyes:'
  },
  {
    emoji: '😋',
    name: 'Rosto Saboreando Comida',
    keywords: ['delicioso', 'gostoso', 'saboroso', 'língua'],
    category: 'smileys-emotion',
    unicode: 'U+1F60B',
    shortcode: ':yum:'
  },
  {
    emoji: '😛',
    name: 'Rosto com Língua de Fora',
    keywords: ['língua', 'brincadeira', 'provocação', 'travesso'],
    category: 'smileys-emotion',
    unicode: 'U+1F61B',
    shortcode: ':stuck_out_tongue:'
  },
  {
    emoji: '😜',
    name: 'Rosto Piscando com Língua de Fora',
    keywords: ['língua', 'piscada', 'brincadeira', 'travesso'],
    category: 'smileys-emotion',
    unicode: 'U+1F61C',
    shortcode: ':stuck_out_tongue_winking_eye:'
  },
  {
    emoji: '🤪',
    name: 'Rosto Maluco',
    keywords: ['maluco', 'louco', 'excêntrico', 'divertido'],
    category: 'smileys-emotion',
    unicode: 'U+1F92A',
    shortcode: ':zany_face:'
  },
  {
    emoji: '😝',
    name: 'Rosto com Língua de Fora e Olhos Apertados',
    keywords: ['língua', 'brincadeira', 'nojento', 'travesso'],
    category: 'smileys-emotion',
    unicode: 'U+1F61D',
    shortcode: ':stuck_out_tongue_closed_eyes:'
  },
  {
    emoji: '🤑',
    name: 'Rosto com Cifrão nos Olhos',
    keywords: ['dinheiro', 'ganancioso', 'rico', 'avarento'],
    category: 'smileys-emotion',
    unicode: 'U+1F911',
    shortcode: ':money_mouth_face:'
  },
  {
    emoji: '🤗',
    name: 'Rosto Abraçando',
    keywords: ['abraço', 'carinho', 'acolhedor', 'afetuoso'],
    category: 'smileys-emotion',
    unicode: 'U+1F917',
    shortcode: ':hugs:'
  },
  {
    emoji: '🤭',
    name: 'Rosto com Mão sobre a Boca',
    keywords: ['segredo', 'sussurro', 'surpresa', 'oops'],
    category: 'smileys-emotion',
    unicode: 'U+1F92D',
    shortcode: ':hand_over_mouth:'
  },
  {
    emoji: '🤫',
    name: 'Rosto Fazendo Silêncio',
    keywords: ['silêncio', 'segredo', 'quieto', 'shh'],
    category: 'smileys-emotion',
    unicode: 'U+1F92B',
    shortcode: ':shushing_face:'
  },
  {
    emoji: '🤔',
    name: 'Rosto Pensativo',
    keywords: ['pensando', 'reflexão', 'dúvida', 'considerando'],
    category: 'smileys-emotion',
    unicode: 'U+1F914',
    shortcode: ':thinking:'
  },
  {
    emoji: '🤐',
    name: 'Rosto com Zíper',
    keywords: ['silêncio', 'calado', 'segredo', 'boca fechada'],
    category: 'smileys-emotion',
    unicode: 'U+1F910',
    shortcode: ':zipper_mouth_face:'
  },
  {
    emoji: '🤨',
    name: 'Rosto com Sobrancelha Levantada',
    keywords: ['cético', 'desconfiado', 'questionando', 'duvidoso'],
    category: 'smileys-emotion',
    unicode: 'U+1F928',
    shortcode: ':raised_eyebrow:'
  },
  {
    emoji: '😐',
    name: 'Rosto Neutro',
    keywords: ['neutro', 'indiferente', 'sem expressão', 'meh'],
    category: 'smileys-emotion',
    unicode: 'U+1F610',
    shortcode: ':neutral_face:'
  },
  {
    emoji: '😑',
    name: 'Rosto Sem Expressão',
    keywords: ['sem expressão', 'entediado', 'indiferente', 'sério'],
    category: 'smileys-emotion',
    unicode: 'U+1F611',
    shortcode: ':expressionless:'
  },
  {
    emoji: '😶',
    name: 'Rosto Sem Boca',
    keywords: ['sem palavras', 'silêncio', 'mudo', 'chocado'],
    category: 'smileys-emotion',
    unicode: 'U+1F636',
    shortcode: ':no_mouth:'
  },
  {
    emoji: '😏',
    name: 'Rosto Sorrindo Maliciosamente',
    keywords: ['malicioso', 'sarcástico', 'presunçoso', 'convencido'],
    category: 'smileys-emotion',
    unicode: 'U+1F60F',
    shortcode: ':smirk:'
  },
  {
    emoji: '😒',
    name: 'Rosto Desanimado',
    keywords: ['desanimado', 'entediado', 'cansado', 'irritado'],
    category: 'smileys-emotion',
    unicode: 'U+1F612',
    shortcode: ':unamused:'
  },
  {
    emoji: '🙄',
    name: 'Rosto com Olhos Revirados',
    keywords: ['olhos revirados', 'irritado', 'sarcástico', 'aborrecido'],
    category: 'smileys-emotion',
    unicode: 'U+1F644',
    shortcode: ':roll_eyes:'
  },
  {
    emoji: '😬',
    name: 'Rosto Fazendo Careta',
    keywords: ['careta', 'constrangido', 'nervoso', 'desconfortável'],
    category: 'smileys-emotion',
    unicode: 'U+1F62C',
    shortcode: ':grimacing:'
  },
  {
    emoji: '🤥',
    name: 'Rosto Mentiroso',
    keywords: ['mentira', 'nariz crescendo', 'desonesto', 'pinóquio'],
    category: 'smileys-emotion',
    unicode: 'U+1F925',
    shortcode: ':lying_face:'
  },
  {
    emoji: '😔',
    name: 'Rosto Pensativo',
    keywords: ['triste', 'pensativo', 'melancólico', 'desanimado'],
    category: 'smileys-emotion',
    unicode: 'U+1F614',
    shortcode: ':pensive:'
  },
  {
    emoji: '😕',
    name: 'Rosto Confuso',
    keywords: ['confuso', 'preocupado', 'incerto', 'perturbado'],
    category: 'smileys-emotion',
    unicode: 'U+1F615',
    shortcode: ':confused:'
  },
  {
    emoji: '🙁',
    name: 'Rosto Ligeiramente Franzido',
    keywords: ['triste', 'desapontado', 'chateado', 'franzido'],
    category: 'smileys-emotion',
    unicode: 'U+1F641',
    shortcode: ':slightly_frowning_face:'
  },
  {
    emoji: '☹️',
    name: 'Rosto Franzido',
    keywords: ['triste', 'desapontado', 'chateado', 'infeliz'],
    category: 'smileys-emotion',
    unicode: 'U+2639',
    shortcode: ':frowning_face:'
  },
  {
    emoji: '😣',
    name: 'Rosto Perseverante',
    keywords: ['perseverante', 'determinado', 'esforçando', 'concentrado'],
    category: 'smileys-emotion',
    unicode: 'U+1F623',
    shortcode: ':persevere:'
  },
  {
    emoji: '😖',
    name: 'Rosto Confuso',
    keywords: ['confuso', 'frustrado', 'perturbado', 'incomodado'],
    category: 'smileys-emotion',
    unicode: 'U+1F616',
    shortcode: ':confounded:'
  },
  {
    emoji: '😫',
    name: 'Rosto Cansado',
    keywords: ['cansado', 'exausto', 'esgotado', 'fatigado'],
    category: 'smileys-emotion',
    unicode: 'U+1F62B',
    shortcode: ':tired_face:'
  },
  {
    emoji: '😩',
    name: 'Rosto Choroso',
    keywords: ['choroso', 'lamentando', 'gemendo', 'sofrendo'],
    category: 'smileys-emotion',
    unicode: 'U+1F629',
    shortcode: ':weary:'
  },
  {
    emoji: '🥺',
    name: 'Rosto Implorando',
    keywords: ['implorando', 'suplicante', 'olhos de cachorro', 'fofo'],
    category: 'smileys-emotion',
    unicode: 'U+1F97A',
    shortcode: ':pleading_face:'
  },
  {
    emoji: '😢',
    name: 'Rosto Chorando',
    keywords: ['chorando', 'triste', 'lágrima', 'melancólico'],
    category: 'smileys-emotion',
    unicode: 'U+1F622',
    shortcode: ':cry:'
  },
  {
    emoji: '😭',
    name: 'Rosto Soluçando Alto',
    keywords: ['soluçando', 'chorando muito', 'devastado', 'inconsolável'],
    category: 'smileys-emotion',
    unicode: 'U+1F62D',
    shortcode: ':sob:'
  },
  {
    emoji: '😤',
    name: 'Rosto com Vapor do Nariz',
    keywords: ['irritado', 'furioso', 'bufando', 'indignado'],
    category: 'smileys-emotion',
    unicode: 'U+1F624',
    shortcode: ':triumph:'
  },
  {
    emoji: '😠',
    name: 'Rosto Bravo',
    keywords: ['bravo', 'irritado', 'zangado', 'furioso'],
    category: 'smileys-emotion',
    unicode: 'U+1F620',
    shortcode: ':angry:'
  },
  {
    emoji: '😡',
    name: 'Rosto Vermelho de Raiva',
    keywords: ['raiva', 'furioso', 'vermelho', 'irado'],
    category: 'smileys-emotion',
    unicode: 'U+1F621',
    shortcode: ':rage:'
  },
  {
    emoji: '🤬',
    name: 'Rosto com Símbolos na Boca',
    keywords: ['palavrão', 'xingando', 'furioso', 'censura'],
    category: 'smileys-emotion',
    unicode: 'U+1F92C',
    shortcode: ':swearing:'
  },
  {
    emoji: '🤯',
    name: 'Cabeça Explodindo',
    keywords: ['mente explodindo', 'chocado', 'impressionado', 'surpreendente'],
    category: 'smileys-emotion',
    unicode: 'U+1F92F',
    shortcode: ':exploding_head:'
  },
  {
    emoji: '😳',
    name: 'Rosto Corado',
    keywords: ['corado', 'envergonhado', 'constrangido', 'tímido'],
    category: 'smileys-emotion',
    unicode: 'U+1F633',
    shortcode: ':flushed:'
  },
  {
    emoji: '🥵',
    name: 'Rosto com Calor',
    keywords: ['calor', 'quente', 'suando', 'febril'],
    category: 'smileys-emotion',
    unicode: 'U+1F975',
    shortcode: ':hot_face:'
  },
  {
    emoji: '🥶',
    name: 'Rosto com Frio',
    keywords: ['frio', 'gelado', 'congelando', 'tremendo'],
    category: 'smileys-emotion',
    unicode: 'U+1F976',
    shortcode: ':cold_face:'
  },
  {
    emoji: '😱',
    name: 'Rosto Gritando de Medo',
    keywords: ['medo', 'terror', 'gritando', 'assustado'],
    category: 'smileys-emotion',
    unicode: 'U+1F631',
    shortcode: ':scream:'
  },
  {
    emoji: '😨',
    name: 'Rosto Amedrontado',
    keywords: ['medo', 'assustado', 'amedrontado', 'terror'],
    category: 'smileys-emotion',
    unicode: 'U+1F628',
    shortcode: ':fearful:'
  },
  {
    emoji: '😰',
    name: 'Rosto Ansioso com Suor',
    keywords: ['ansioso', 'nervoso', 'suor', 'preocupado'],
    category: 'smileys-emotion',
    unicode: 'U+1F630',
    shortcode: ':cold_sweat:'
  },
  {
    emoji: '😥',
    name: 'Rosto Triste mas Aliviado',
    keywords: ['triste', 'aliviado', 'desapontado', 'suspirar'],
    category: 'smileys-emotion',
    unicode: 'U+1F625',
    shortcode: ':disappointed_relieved:'
  },
  {
    emoji: '😓',
    name: 'Rosto com Suor Frio',
    keywords: ['suor frio', 'nervoso', 'ansioso', 'estressado'],
    category: 'smileys-emotion',
    unicode: 'U+1F613',
    shortcode: ':sweat:'
  },
  {
    emoji: '🤗',
    name: 'Rosto Abraçando',
    keywords: ['abraço', 'carinho', 'acolhedor', 'afetuoso'],
    category: 'smileys-emotion',
    unicode: 'U+1F917',
    shortcode: ':hugs:'
  },
  {
    emoji: '🤔',
    name: 'Rosto Pensativo',
    keywords: ['pensando', 'reflexão', 'dúvida', 'considerando'],
    category: 'smileys-emotion',
    unicode: 'U+1F914',
    shortcode: ':thinking:'
  },
  {
    emoji: '🤫',
    name: 'Rosto Fazendo Silêncio',
    keywords: ['silêncio', 'segredo', 'quieto', 'shh'],
    category: 'smileys-emotion',
    unicode: 'U+1F92B',
    shortcode: ':shushing_face:'
  },
  {
    emoji: '🤭',
    name: 'Rosto com Mão sobre a Boca',
    keywords: ['segredo', 'sussurro', 'surpresa', 'oops'],
    category: 'smileys-emotion',
    unicode: 'U+1F92D',
    shortcode: ':hand_over_mouth:'
  },
  {
    emoji: '🙄',
    name: 'Rosto com Olhos Revirados',
    keywords: ['olhos revirados', 'irritado', 'sarcástico', 'aborrecido'],
    category: 'smileys-emotion',
    unicode: 'U+1F644',
    shortcode: ':roll_eyes:'
  },

  // Pessoas e Corpo
  {
    emoji: '👋',
    name: 'Acenando',
    keywords: ['acenando', 'oi', 'tchau', 'cumprimento'],
    category: 'people-body',
    skinTones: ['👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'],
    unicode: 'U+1F44B',
    shortcode: ':wave:'
  },
  {
    emoji: '🤚',
    name: 'Dorso da Mão Levantada',
    keywords: ['pare', 'mão', 'alto', 'stop'],
    category: 'people-body',
    skinTones: ['🤚🏻', '🤚🏼', '🤚🏽', '🤚🏾', '🤚🏿'],
    unicode: 'U+1F91A',
    shortcode: ':raised_back_of_hand:'
  },
  {
    emoji: '🖐️',
    name: 'Mão com Dedos Abertos',
    keywords: ['mão', 'cinco', 'dedos', 'aberta'],
    category: 'people-body',
    skinTones: ['🖐🏻', '🖐🏼', '🖐🏽', '🖐🏾', '🖐🏿'],
    unicode: 'U+1F590',
    shortcode: ':hand_with_fingers_splayed:'
  },
  {
    emoji: '✋',
    name: 'Mão Levantada',
    keywords: ['pare', 'mão', 'alto', 'stop'],
    category: 'people-body',
    skinTones: ['✋🏻', '✋🏼', '✋🏽', '✋🏾', '✋🏿'],
    unicode: 'U+270B',
    shortcode: ':raised_hand:'
  },
  {
    emoji: '🖖',
    name: 'Saudação Vulcana',
    keywords: ['vulcano', 'spock', 'star trek', 'saudação'],
    category: 'people-body',
    skinTones: ['🖖🏻', '🖖🏼', '🖖🏽', '🖖🏾', '🖖🏿'],
    unicode: 'U+1F596',
    shortcode: ':vulcan_salute:'
  },
  {
    emoji: '👌',
    name: 'Sinal de OK',
    keywords: ['ok', 'perfeito', 'bom', 'aprovado'],
    category: 'people-body',
    skinTones: ['👌🏻', '👌🏼', '👌🏽', '👌🏾', '👌🏿'],
    unicode: 'U+1F44C',
    shortcode: ':ok_hand:'
  },
  {
    emoji: '🤌',
    name: 'Dedos Beliscando',
    keywords: ['beliscando', 'italiano', 'gesto', 'pequeno'],
    category: 'people-body',
    skinTones: ['🤌🏻', '🤌🏼', '🤌🏽', '🤌🏾', '🤌🏿'],
    unicode: 'U+1F90C',
    shortcode: ':pinched_fingers:'
  },
  {
    emoji: '🤏',
    name: 'Mão Beliscando',
    keywords: ['pequeno', 'pouco', 'beliscando', 'minúsculo'],
    category: 'people-body',
    skinTones: ['🤏🏻', '🤏🏼', '🤏🏽', '🤏🏾', '🤏🏿'],
    unicode: 'U+1F90F',
    shortcode: ':pinching_hand:'
  },
  {
    emoji: '✌️',
    name: 'Sinal de Vitória',
    keywords: ['vitória', 'paz', 'dois', 'v'],
    category: 'people-body',
    skinTones: ['✌🏻', '✌🏼', '✌🏽', '✌🏾', '✌🏿'],
    unicode: 'U+270C',
    shortcode: ':v:'
  },
  {
    emoji: '🤞',
    name: 'Dedos Cruzados',
    keywords: ['sorte', 'esperança', 'cruzados', 'desejo'],
    category: 'people-body',
    skinTones: ['🤞🏻', '🤞🏼', '🤞🏽', '🤞🏾', '🤞🏿'],
    unicode: 'U+1F91E',
    shortcode: ':crossed_fingers:'
  },
  {
    emoji: '🤟',
    name: 'Gesto de Amor',
    keywords: ['amor', 'rock', 'metal', 'amo você'],
    category: 'people-body',
    skinTones: ['🤟🏻', '🤟🏼', '🤟🏽', '🤟🏾', '🤟🏿'],
    unicode: 'U+1F91F',
    shortcode: ':love_you_gesture:'
  },
  {
    emoji: '🤘',
    name: 'Sinal de Rock',
    keywords: ['rock', 'metal', 'chifres', 'música'],
    category: 'people-body',
    skinTones: ['🤘🏻', '🤘🏼', '🤘🏽', '🤘🏾', '🤘🏿'],
    unicode: 'U+1F918',
    shortcode: ':metal:'
  },
  {
    emoji: '🤙',
    name: 'Sinal de Chamada',
    keywords: ['chamada', 'telefone', 'relaxar', 'surf'],
    category: 'people-body',
    skinTones: ['🤙🏻', '🤙🏼', '🤙🏽', '🤙🏾', '🤙🏿'],
    unicode: 'U+1F919',
    shortcode: ':call_me_hand:'
  },
  {
    emoji: '👈',
    name: 'Indicador Apontando para a Esquerda',
    keywords: ['apontando', 'esquerda', 'direção', 'indicador'],
    category: 'people-body',
    skinTones: ['👈🏻', '👈🏼', '👈🏽', '👈🏾', '👈🏿'],
    unicode: 'U+1F448',
    shortcode: ':point_left:'
  },
  {
    emoji: '👉',
    name: 'Indicador Apontando para a Direita',
    keywords: ['apontando', 'direita', 'direção', 'indicador'],
    category: 'people-body',
    skinTones: ['👉🏻', '👉🏼', '👉🏽', '👉🏾', '👉🏿'],
    unicode: 'U+1F449',
    shortcode: ':point_right:'
  },
  {
    emoji: '👆',
    name: 'Indicador Apontando para Cima',
    keywords: ['apontando', 'cima', 'direção', 'indicador'],
    category: 'people-body',
    skinTones: ['👆🏻', '👆🏼', '👆🏽', '👆🏾', '👆🏿'],
    unicode: 'U+1F446',
    shortcode: ':point_up_2:'
  },
  {
    emoji: '🖕',
    name: 'Dedo do Meio',
    keywords: ['dedo médio', 'ofensivo', 'rude', 'insulto'],
    category: 'people-body',
    skinTones: ['🖕🏻', '🖕🏼', '🖕🏽', '🖕🏾', '🖕🏿'],
    unicode: 'U+1F595',
    shortcode: ':middle_finger:'
  },
  {
    emoji: '👇',
    name: 'Indicador Apontando para Baixo',
    keywords: ['apontando', 'baixo', 'direção', 'indicador'],
    category: 'people-body',
    skinTones: ['👇🏻', '👇🏼', '👇🏽', '👇🏾', '👇🏿'],
    unicode: 'U+1F447',
    shortcode: ':point_down:'
  },
  {
    emoji: '☝️',
    name: 'Indicador Apontando para Cima',
    keywords: ['apontando', 'cima', 'um', 'primeiro'],
    category: 'people-body',
    skinTones: ['☝🏻', '☝🏼', '☝🏽', '☝🏾', '☝🏿'],
    unicode: 'U+261D',
    shortcode: ':point_up:'
  },
  {
    emoji: '👍',
    name: 'Polegar para Cima',
    keywords: ['polegar', 'cima', 'aprovação', 'like', 'bom'],
    category: 'people-body',
    skinTones: ['👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿'],
    unicode: 'U+1F44D',
    shortcode: ':+1:'
  },
  {
    emoji: '👎',
    name: 'Polegar para Baixo',
    keywords: ['polegar', 'baixo', 'desaprovação', 'dislike', 'ruim'],
    category: 'people-body',
    skinTones: ['👎🏻', '👎🏼', '👎🏽', '👎🏾', '👎🏿'],
    unicode: 'U+1F44E',
    shortcode: ':-1:'
  },
  {
    emoji: '✊',
    name: 'Punho Levantado',
    keywords: ['punho', 'poder', 'força', 'resistência'],
    category: 'people-body',
    skinTones: ['✊🏻', '✊🏼', '✊🏽', '✊🏾', '✊🏿'],
    unicode: 'U+270A',
    shortcode: ':fist:'
  },
  {
    emoji: '👊',
    name: 'Punho Chegando',
    keywords: ['punho', 'soco', 'cumprimento', 'força'],
    category: 'people-body',
    skinTones: ['👊🏻', '👊🏼', '👊🏽', '👊🏾', '👊🏿'],
    unicode: 'U+1F44A',
    shortcode: ':facepunch:'
  },
  {
    emoji: '🤛',
    name: 'Punho para a Esquerda',
    keywords: ['punho', 'esquerda', 'cumprimento', 'soco'],
    category: 'people-body',
    skinTones: ['🤛🏻', '🤛🏼', '🤛🏽', '🤛🏾', '🤛🏿'],
    unicode: 'U+1F91B',
    shortcode: ':fist_left:'
  },
  {
    emoji: '🤜',
    name: 'Punho para a Direita',
    keywords: ['punho', 'direita', 'cumprimento', 'soco'],
    category: 'people-body',
    skinTones: ['🤜🏻', '🤜🏼', '🤜🏽', '🤜🏾', '🤜🏿'],
    unicode: 'U+1F91C',
    shortcode: ':fist_right:'
  },
  {
    emoji: '👏',
    name: 'Palmas',
    keywords: ['palmas', 'aplausos', 'parabéns', 'aprovação'],
    category: 'people-body',
    skinTones: ['👏🏻', '👏🏼', '👏🏽', '👏🏾', '👏🏿'],
    unicode: 'U+1F44F',
    shortcode: ':clap:'
  },
  {
    emoji: '🙌',
    name: 'Mãos Levantadas Celebrando',
    keywords: ['celebração', 'aleluia', 'vitória', 'sucesso'],
    category: 'people-body',
    skinTones: ['🙌🏻', '🙌🏼', '🙌🏽', '🙌🏾', '🙌🏿'],
    unicode: 'U+1F64C',
    shortcode: ':raised_hands:'
  },
  {
    emoji: '👐',
    name: 'Mãos Abertas',
    keywords: ['mãos abertas', 'abraço', 'acolhimento', 'receptivo'],
    category: 'people-body',
    skinTones: ['👐🏻', '👐🏼', '👐🏽', '👐🏾', '👐🏿'],
    unicode: 'U+1F450',
    shortcode: ':open_hands:'
  },
  {
    emoji: '🤲',
    name: 'Palmas para Cima Juntas',
    keywords: ['oração', 'súplica', 'pedindo', 'recebendo'],
    category: 'people-body',
    skinTones: ['🤲🏻', '🤲🏼', '🤲🏽', '🤲🏾', '🤲🏿'],
    unicode: 'U+1F932',
    shortcode: ':palms_up_together:'
  },
  {
    emoji: '🤝',
    name: 'Aperto de Mão',
    keywords: ['aperto de mão', 'acordo', 'parceria', 'cumprimento'],
    category: 'people-body',
    unicode: 'U+1F91D',
    shortcode: ':handshake:'
  },
  {
    emoji: '🙏',
    name: 'Mãos Dobradas',
    keywords: ['oração', 'obrigado', 'por favor', 'namastê'],
    category: 'people-body',
    skinTones: ['🙏🏻', '🙏🏼', '🙏🏽', '🙏🏾', '🙏🏿'],
    unicode: 'U+1F64F',
    shortcode: ':pray:'
  },

  // Animais e Natureza
  {
    emoji: '🐶',
    name: 'Rosto de Cachorro',
    keywords: ['cachorro', 'cão', 'animal', 'pet'],
    category: 'animals-nature',
    unicode: 'U+1F436',
    shortcode: ':dog:'
  },
  {
    emoji: '🐱',
    name: 'Rosto de Gato',
    keywords: ['gato', 'felino', 'animal', 'pet'],
    category: 'animals-nature',
    unicode: 'U+1F431',
    shortcode: ':cat:'
  },
  {
    emoji: '🐭',
    name: 'Rosto de Rato',
    keywords: ['rato', 'mouse', 'roedor', 'pequeno'],
    category: 'animals-nature',
    unicode: 'U+1F42D',
    shortcode: ':mouse:'
  },
  {
    emoji: '🐹',
    name: 'Rosto de Hamster',
    keywords: ['hamster', 'roedor', 'fofo', 'pet'],
    category: 'animals-nature',
    unicode: 'U+1F439',
    shortcode: ':hamster:'
  },
  {
    emoji: '🐰',
    name: 'Rosto de Coelho',
    keywords: ['coelho', 'lebre', 'fofo', 'páscoa'],
    category: 'animals-nature',
    unicode: 'U+1F430',
    shortcode: ':rabbit:'
  },
  {
    emoji: '🦊',
    name: 'Rosto de Raposa',
    keywords: ['raposa', 'astuto', 'selvagem', 'laranja'],
    category: 'animals-nature',
    unicode: 'U+1F98A',
    shortcode: ':fox_face:'
  },
  {
    emoji: '🐻',
    name: 'Rosto de Urso',
    keywords: ['urso', 'forte', 'selvagem', 'grande'],
    category: 'animals-nature',
    unicode: 'U+1F43B',
    shortcode: ':bear:'
  },
  {
    emoji: '🐼',
    name: 'Rosto de Panda',
    keywords: ['panda', 'fofo', 'china', 'bambu'],
    category: 'animals-nature',
    unicode: 'U+1F43C',
    shortcode: ':panda_face:'
  },
  {
    emoji: '🐨',
    name: 'Coala',
    keywords: ['coala', 'austrália', 'fofo', 'eucalipto'],
    category: 'animals-nature',
    unicode: 'U+1F428',
    shortcode: ':koala:'
  },
  {
    emoji: '🐯',
    name: 'Rosto de Tigre',
    keywords: ['tigre', 'felino', 'selvagem', 'listras'],
    category: 'animals-nature',
    unicode: 'U+1F42F',
    shortcode: ':tiger:'
  },
  {
    emoji: '🦁',
    name: 'Rosto de Leão',
    keywords: ['leão', 'rei', 'selvagem', 'juba'],
    category: 'animals-nature',
    unicode: 'U+1F981',
    shortcode: ':lion:'
  },
  {
    emoji: '🐮',
    name: 'Rosto de Vaca',
    keywords: ['vaca', 'boi', 'fazenda', 'leite'],
    category: 'animals-nature',
    unicode: 'U+1F42E',
    shortcode: ':cow:'
  },
  {
    emoji: '🐷',
    name: 'Rosto de Porco',
    keywords: ['porco', 'suíno', 'fazenda', 'rosa'],
    category: 'animals-nature',
    unicode: 'U+1F437',
    shortcode: ':pig:'
  },
  {
    emoji: '🐸',
    name: 'Rosto de Sapo',
    keywords: ['sapo', 'verde', 'anfíbio', 'lagoa'],
    category: 'animals-nature',
    unicode: 'U+1F438',
    shortcode: ':frog:'
  },
  {
    emoji: '🐵',
    name: 'Rosto de Macaco',
    keywords: ['macaco', 'primata', 'banana', 'travesso'],
    category: 'animals-nature',
    unicode: 'U+1F435',
    shortcode: ':monkey_face:'
  },
  {
    emoji: '🙈',
    name: 'Macaco Não Vê',
    keywords: ['não vejo', 'macaco', 'ignorar', 'esconder'],
    category: 'animals-nature',
    unicode: 'U+1F648',
    shortcode: ':see_no_evil:'
  },
  {
    emoji: '🙉',
    name: 'Macaco Não Ouve',
    keywords: ['não ouço', 'macaco', 'ignorar', 'surdo'],
    category: 'animals-nature',
    unicode: 'U+1F649',
    shortcode: ':hear_no_evil:'
  },
  {
    emoji: '🙊',
    name: 'Macaco Não Fala',
    keywords: ['não falo', 'macaco', 'silêncio', 'segredo'],
    category: 'animals-nature',
    unicode: 'U+1F64A',
    shortcode: ':speak_no_evil:'
  },
  {
    emoji: '🐔',
    name: 'Galinha',
    keywords: ['galinha', 'ave', 'fazenda', 'ovo'],
    category: 'animals-nature',
    unicode: 'U+1F414',
    shortcode: ':chicken:'
  },
  {
    emoji: '🐧',
    name: 'Pinguim',
    keywords: ['pinguim', 'ave', 'antártica', 'frio'],
    category: 'animals-nature',
    unicode: 'U+1F427',
    shortcode: ':penguin:'
  },
  {
    emoji: '🐦',
    name: 'Pássaro',
    keywords: ['pássaro', 'ave', 'voar', 'cantar'],
    category: 'animals-nature',
    unicode: 'U+1F426',
    shortcode: ':bird:'
  },
  {
    emoji: '🐤',
    name: 'Pintinho',
    keywords: ['pintinho', 'bebê', 'ave', 'fofo'],
    category: 'animals-nature',
    unicode: 'U+1F424',
    shortcode: ':baby_chick:'
  },
  {
    emoji: '🐣',
    name: 'Pintinho Nascendo',
    keywords: ['nascendo', 'pintinho', 'ovo', 'novo'],
    category: 'animals-nature',
    unicode: 'U+1F423',
    shortcode: ':hatching_chick:'
  },
  {
    emoji: '🐥',
    name: 'Pintinho de Frente',
    keywords: ['pintinho', 'frente', 'ave', 'amarelo'],
    category: 'animals-nature',
    unicode: 'U+1F425',
    shortcode: ':hatched_chick:'
  },
  {
    emoji: '🦆',
    name: 'Pato',
    keywords: ['pato', 'ave', 'água', 'lagoa'],
    category: 'animals-nature',
    unicode: 'U+1F986',
    shortcode: ':duck:'
  },
  {
    emoji: '🦅',
    name: 'Águia',
    keywords: ['águia', 'ave', 'predador', 'majestosa'],
    category: 'animals-nature',
    unicode: 'U+1F985',
    shortcode: ':eagle:'
  },
  {
    emoji: '🦉',
    name: 'Coruja',
    keywords: ['coruja', 'ave', 'noturna', 'sábia'],
    category: 'animals-nature',
    unicode: 'U+1F989',
    shortcode: ':owl:'
  },
  {
    emoji: '🦇',
    name: 'Morcego',
    keywords: ['morcego', 'noturno', 'voar', 'escuro'],
    category: 'animals-nature',
    unicode: 'U+1F987',
    shortcode: ':bat:'
  },
  {
    emoji: '🐺',
    name: 'Lobo',
    keywords: ['lobo', 'selvagem', 'matilha', 'uivar'],
    category: 'animals-nature',
    unicode: 'U+1F43A',
    shortcode: ':wolf:'
  },
  {
    emoji: '🐗',
    name: 'Javali',
    keywords: ['javali', 'porco selvagem', 'selvagem', 'forte'],
    category: 'animals-nature',
    unicode: 'U+1F417',
    shortcode: ':boar:'
  },
  {
    emoji: '🐴',
    name: 'Rosto de Cavalo',
    keywords: ['cavalo', 'equino', 'galope', 'nobre'],
    category: 'animals-nature',
    unicode: 'U+1F434',
    shortcode: ':horse:'
  },
  {
    emoji: '🦄',
    name: 'Unicórnio',
    keywords: ['unicórnio', 'mágico', 'fantasia', 'chifre'],
    category: 'animals-nature',
    unicode: 'U+1F984',
    shortcode: ':unicorn:'
  },
  {
    emoji: '🐝',
    name: 'Abelha',
    keywords: ['abelha', 'mel', 'inseto', 'trabalhadora'],
    category: 'animals-nature',
    unicode: 'U+1F41D',
    shortcode: ':bee:'
  },
  {
    emoji: '🐛',
    name: 'Inseto',
    keywords: ['inseto', 'bug', 'pequeno', 'rastejante'],
    category: 'animals-nature',
    unicode: 'U+1F41B',
    shortcode: ':bug:'
  },
  {
    emoji: '🦋',
    name: 'Borboleta',
    keywords: ['borboleta', 'transformação', 'colorida', 'voar'],
    category: 'animals-nature',
    unicode: 'U+1F98B',
    shortcode: ':butterfly:'
  },
  {
    emoji: '🐌',
    name: 'Caracol',
    keywords: ['caracol', 'lento', 'casa', 'espiral'],
    category: 'animals-nature',
    unicode: 'U+1F40C',
    shortcode: ':snail:'
  },
  {
    emoji: '🐞',
    name: 'Joaninha',
    keywords: ['joaninha', 'inseto', 'sorte', 'vermelha'],
    category: 'animals-nature',
    unicode: 'U+1F41E',
    shortcode: ':beetle:'
  },
  {
    emoji: '🐜',
    name: 'Formiga',
    keywords: ['formiga', 'trabalhadora', 'pequena', 'organizada'],
    category: 'animals-nature',
    unicode: 'U+1F41C',
    shortcode: ':ant:'
  },
  {
    emoji: '🦗',
    name: 'Grilo',
    keywords: ['grilo', 'inseto', 'som', 'noturno'],
    category: 'animals-nature',
    unicode: 'U+1F997',
    shortcode: ':cricket:'
  },
  {
    emoji: '🕷️',
    name: 'Aranha',
    keywords: ['aranha', 'teia', 'oito patas', 'predadora'],
    category: 'animals-nature',
    unicode: 'U+1F577',
    shortcode: ':spider:'
  },
  {
    emoji: '🕸️',
    name: 'Teia de Aranha',
    keywords: ['teia', 'aranha', 'armadilha', 'delicada'],
    category: 'animals-nature',
    unicode: 'U+1F578',
    shortcode: ':spider_web:'
  },
  {
    emoji: '🦂',
    name: 'Escorpião',
    keywords: ['escorpião', 'venenoso', 'deserto', 'ferrão'],
    category: 'animals-nature',
    unicode: 'U+1F982',
    shortcode: ':scorpion:'
  },
  {
    emoji: '🐢',
    name: 'Tartaruga',
    keywords: ['tartaruga', 'lenta', 'casco', 'longevidade'],
    category: 'animals-nature',
    unicode: 'U+1F422',
    shortcode: ':turtle:'
  },
  {
    emoji: '🐍',
    name: 'Cobra',
    keywords: ['cobra', 'serpente', 'rastejante', 'venenosa'],
    category: 'animals-nature',
    unicode: 'U+1F40D',
    shortcode: ':snake:'
  },
  {
    emoji: '🦎',
    name: 'Lagarto',
    keywords: ['lagarto', 'réptil', 'camuflagem', 'rabo'],
    category: 'animals-nature',
    unicode: 'U+1F98E',
    shortcode: ':lizard:'
  },
  {
    emoji: '🦖',
    name: 'T-Rex',
    keywords: ['dinossauro', 't-rex', 'extinto', 'predador'],
    category: 'animals-nature',
    unicode: 'U+1F996',
    shortcode: ':t-rex:'
  },
  {
    emoji: '🦕',
    name: 'Saurópode',
    keywords: ['dinossauro', 'saurópode', 'extinto', 'herbívoro'],
    category: 'animals-nature',
    unicode: 'U+1F995',
    shortcode: ':sauropod:'
  },
  {
    emoji: '🐙',
    name: 'Polvo',
    keywords: ['polvo', 'oito braços', 'mar', 'inteligente'],
    category: 'animals-nature',
    unicode: 'U+1F419',
    shortcode: ':octopus:'
  },
  {
    emoji: '🦑',
    name: 'Lula',
    keywords: ['lula', 'mar', 'tentáculos', 'tinta'],
    category: 'animals-nature',
    unicode: 'U+1F991',
    shortcode: ':squid:'
  },
  {
    emoji: '🦐',
    name: 'Camarão',
    keywords: ['camarão', 'mar', 'crustáceo', 'pequeno'],
    category: 'animals-nature',
    unicode: 'U+1F990',
    shortcode: ':shrimp:'
  },
  {
    emoji: '🦞',
    name: 'Lagosta',
    keywords: ['lagosta', 'mar', 'crustáceo', 'garras'],
    category: 'animals-nature',
    unicode: 'U+1F99E',
    shortcode: ':lobster:'
  },
  {
    emoji: '🦀',
    name: 'Caranguejo',
    keywords: ['caranguejo', 'mar', 'crustáceo', 'lateral'],
    category: 'animals-nature',
    unicode: 'U+1F980',
    shortcode: ':crab:'
  },
  {
    emoji: '🐡',
    name: 'Peixe Baiacu',
    keywords: ['peixe', 'baiacu', 'espinhos', 'inflável'],
    category: 'animals-nature',
    unicode: 'U+1F421',
    shortcode: ':blowfish:'
  },
  {
    emoji: '🐠',
    name: 'Peixe Tropical',
    keywords: ['peixe', 'tropical', 'colorido', 'aquário'],
    category: 'animals-nature',
    unicode: 'U+1F420',
    shortcode: ':tropical_fish:'
  },
  {
    emoji: '🐟',
    name: 'Peixe',
    keywords: ['peixe', 'mar', 'nadar', 'água'],
    category: 'animals-nature',
    unicode: 'U+1F41F',
    shortcode: ':fish:'
  },
  {
    emoji: '🐬',
    name: 'Golfinho',
    keywords: ['golfinho', 'inteligente', 'mar', 'amigável'],
    category: 'animals-nature',
    unicode: 'U+1F42C',
    shortcode: ':dolphin:'
  },
  {
    emoji: '🐳',
    name: 'Baleia',
    keywords: ['baleia', 'grande', 'mar', 'mamífero'],
    category: 'animals-nature',
    unicode: 'U+1F433',
    shortcode: ':whale:'
  },
  {
    emoji: '🐋',
    name: 'Baleia Esguichando',
    keywords: ['baleia', 'esguicho', 'água', 'mar'],
    category: 'animals-nature',
    unicode: 'U+1F40B',
    shortcode: ':whale2:'
  },
  {
    emoji: '🦈',
    name: 'Tubarão',
    keywords: ['tubarão', 'predador', 'mar', 'perigoso'],
    category: 'animals-nature',
    unicode: 'U+1F988',
    shortcode: ':shark:'
  },

  // Comida e Bebida
  {
    emoji: '🍎',
    name: 'Maçã Vermelha',
    keywords: ['maçã', 'fruta', 'vermelha', 'saudável'],
    category: 'food-drink',
    unicode: 'U+1F34E',
    shortcode: ':apple:'
  },
  {
    emoji: '🍊',
    name: 'Laranja',
    keywords: ['laranja', 'fruta', 'cítrica', 'vitamina'],
    category: 'food-drink',
    unicode: 'U+1F34A',
    shortcode: ':orange:'
  },
  {
    emoji: '🍌',
    name: 'Banana',
    keywords: ['banana', 'fruta', 'amarela', 'potássio'],
    category: 'food-drink',
    unicode: 'U+1F34C',
    shortcode: ':banana:'
  },
  {
    emoji: '🍇',
    name: 'Uvas',
    keywords: ['uvas', 'fruta', 'cacho', 'vinho'],
    category: 'food-drink',
    unicode: 'U+1F347',
    shortcode: ':grapes:'
  },
  {
    emoji: '🍓',
    name: 'Morango',
    keywords: ['morango', 'fruta', 'vermelho', 'doce'],
    category: 'food-drink',
    unicode: 'U+1F353',
    shortcode: ':strawberry:'
  },
  {
    emoji: '🥝',
    name: 'Kiwi',
    keywords: ['kiwi', 'fruta', 'verde', 'ácido'],
    category: 'food-drink',
    unicode: 'U+1F95D',
    shortcode: ':kiwi_fruit:'
  },
  {
    emoji: '🍑',
    name: 'Cerejas',
    keywords: ['cerejas', 'fruta', 'vermelhas', 'doces'],
    category: 'food-drink',
    unicode: 'U+1F351',
    shortcode: ':cherries:'
  },
  {
    emoji: '🍒',
    name: 'Cerejas',
    keywords: ['cerejas', 'fruta', 'vermelhas', 'par'],
    category: 'food-drink',
    unicode: 'U+1F352',
    shortcode: ':cherries:'
  },
  {
    emoji: '🥭',
    name: 'Manga',
    keywords: ['manga', 'fruta', 'tropical', 'doce'],
    category: 'food-drink',
    unicode: 'U+1F96D',
    shortcode: ':mango:'
  },
  {
    emoji: '🍍',
    name: 'Abacaxi',
    keywords: ['abacaxi', 'fruta', 'tropical', 'espinhoso'],
    category: 'food-drink',
    unicode: 'U+1F34D',
    shortcode: ':pineapple:'
  },
  {
    emoji: '🥥',
    name: 'Coco',
    keywords: ['coco', 'fruta', 'tropical', 'água'],
    category: 'food-drink',
    unicode: 'U+1F965',
    shortcode: ':coconut:'
  },
  {
    emoji: '🍅',
    name: 'Tomate',
    keywords: ['tomate', 'vermelho', 'salada', 'vegetal'],
    category: 'food-drink',
    unicode: 'U+1F345',
    shortcode: ':tomato:'
  },
  {
    emoji: '🍆',
    name: 'Berinjela',
    keywords: ['berinjela', 'roxa', 'vegetal', 'alongada'],
    category: 'food-drink',
    unicode: 'U+1F346',
    shortcode: ':eggplant:'
  },
  {
    emoji: '🥑',
    name: 'Abacate',
    keywords: ['abacate', 'verde', 'saudável', 'cremoso'],
    category: 'food-drink',
    unicode: 'U+1F951',
    shortcode: ':avocado:'
  },
  {
    emoji: '🥦',
    name: 'Brócolis',
    keywords: ['brócolis', 'verde', 'saudável', 'vegetal'],
    category: 'food-drink',
    unicode: 'U+1F966',
    shortcode: ':broccoli:'
  },
  {
    emoji: '🥬',
    name: 'Folhas Verdes',
    keywords: ['folhas', 'verdes', 'salada', 'saudável'],
    category: 'food-drink',
    unicode: 'U+1F96C',
    shortcode: ':leafy_greens:'
  },
  {
    emoji: '🥒',
    name: 'Pepino',
    keywords: ['pepino', 'verde', 'fresco', 'salada'],
    category: 'food-drink',
    unicode: 'U+1F952',
    shortcode: ':cucumber:'
  },
  {
    emoji: '🌶️',
    name: 'Pimenta',
    keywords: ['pimenta', 'vermelha', 'picante', 'quente'],
    category: 'food-drink',
    unicode: 'U+1F336',
    shortcode: ':hot_pepper:'
  },
  {
    emoji: '🌽',
    name: 'Milho',
    keywords: ['milho', 'amarelo', 'espiga', 'grão'],
    category: 'food-drink',
    unicode: 'U+1F33D',
    shortcode: ':corn:'
  },
  {
    emoji: '🥕',
    name: 'Cenoura',
    keywords: ['cenoura', 'laranja', 'vegetal', 'raiz'],
    category: 'food-drink',
    unicode: 'U+1F955',
    shortcode: ':carrot:'
  },
  {
    emoji: '🧄',
    name: 'Alho',
    keywords: ['alho', 'tempero', 'branco', 'aromático'],
    category: 'food-drink',
    unicode: 'U+1F9C4',
    shortcode: ':garlic:'
  },
  {
    emoji: '🧅',
    name: 'Cebola',
    keywords: ['cebola', 'tempero', 'lágrimas', 'camadas'],
    category: 'food-drink',
    unicode: 'U+1F9C5',
    shortcode: ':onion:'
  },
  {
    emoji: '🥔',
    name: 'Batata',
    keywords: ['batata', 'tubérculo', 'marrom', 'carboidrato'],
    category: 'food-drink',
    unicode: 'U+1F954',
    shortcode: ':potato:'
  },
  {
    emoji: '🍠',
    name: 'Batata Doce',
    keywords: ['batata doce', 'laranja', 'doce', 'assada'],
    category: 'food-drink',
    unicode: 'U+1F360',
    shortcode: ':sweet_potato:'
  },

  // Símbolos e Objetos
  {
    emoji: '❤️',
    name: 'Coração Vermelho',
    keywords: ['amor', 'coração', 'vermelho', 'paixão'],
    category: 'symbols',
    unicode: 'U+2764',
    shortcode: ':heart:'
  },
  {
    emoji: '🧡',
    name: 'Coração Laranja',
    keywords: ['amor', 'coração', 'laranja', 'carinho'],
    category: 'symbols',
    unicode: 'U+1F9E1',
    shortcode: ':orange_heart:'
  },
  {
    emoji: '💛',
    name: 'Coração Amarelo',
    keywords: ['amor', 'coração', 'amarelo', 'amizade'],
    category: 'symbols',
    unicode: 'U+1F49B',
    shortcode: ':yellow_heart:'
  },
  {
    emoji: '💚',
    name: 'Coração Verde',
    keywords: ['amor', 'coração', 'verde', 'natureza'],
    category: 'symbols',
    unicode: 'U+1F49A',
    shortcode: ':green_heart:'
  },
  {
    emoji: '💙',
    name: 'Coração Azul',
    keywords: ['amor', 'coração', 'azul', 'confiança'],
    category: 'symbols',
    unicode: 'U+1F499',
    shortcode: ':blue_heart:'
  },
  {
    emoji: '💜',
    name: 'Coração Roxo',
    keywords: ['amor', 'coração', 'roxo', 'magia'],
    category: 'symbols',
    unicode: 'U+1F49C',
    shortcode: ':purple_heart:'
  },
  {
    emoji: '🖤',
    name: 'Coração Preto',
    keywords: ['amor', 'coração', 'preto', 'gótico'],
    category: 'symbols',
    unicode: 'U+1F5A4',
    shortcode: ':black_heart:'
  },
  {
    emoji: '🤍',
    name: 'Coração Branco',
    keywords: ['amor', 'coração', 'branco', 'puro'],
    category: 'symbols',
    unicode: 'U+1F90D',
    shortcode: ':white_heart:'
  },
  {
    emoji: '🤎',
    name: 'Coração Marrom',
    keywords: ['amor', 'coração', 'marrom', 'terra'],
    category: 'symbols',
    unicode: 'U+1F90E',
    shortcode: ':brown_heart:'
  },
  {
    emoji: '💔',
    name: 'Coração Partido',
    keywords: ['coração partido', 'tristeza', 'fim', 'dor'],
    category: 'symbols',
    unicode: 'U+1F494',
    shortcode: ':broken_heart:'
  },
  {
    emoji: '❣️',
    name: 'Exclamação de Coração',
    keywords: ['coração', 'exclamação', 'ênfase', 'amor'],
    category: 'symbols',
    unicode: 'U+2763',
    shortcode: ':heavy_heart_exclamation:'
  },
  {
    emoji: '💕',
    name: 'Dois Corações',
    keywords: ['dois corações', 'amor', 'romance', 'casal'],
    category: 'symbols',
    unicode: 'U+1F495',
    shortcode: ':two_hearts:'
  },
  {
    emoji: '💞',
    name: 'Corações Girando',
    keywords: ['corações girando', 'amor', 'romance', 'paixão'],
    category: 'symbols',
    unicode: 'U+1F49E',
    shortcode: ':revolving_hearts:'
  },
  {
    emoji: '💓',
    name: 'Coração Batendo',
    keywords: ['coração batendo', 'amor', 'pulsação', 'vida'],
    category: 'symbols',
    unicode: 'U+1F493',
    shortcode: ':heartbeat:'
  },
  {
    emoji: '💗',
    name: 'Coração Crescendo',
    keywords: ['coração crescendo', 'amor', 'aumentando', 'paixão'],
    category: 'symbols',
    unicode: 'U+1F497',
    shortcode: ':heartpulse:'
  },
  {
    emoji: '💖',
    name: 'Coração Brilhante',
    keywords: ['coração brilhante', 'amor', 'especial', 'mágico'],
    category: 'symbols',
    unicode: 'U+1F496',
    shortcode: ':sparkling_heart:'
  },
  {
    emoji: '💘',
    name: 'Coração com Flecha',
    keywords: ['coração flecha', 'cupido', 'amor', 'paixão'],
    category: 'symbols',
    unicode: 'U+1F498',
    shortcode: ':cupid:'
  },
  {
    emoji: '💝',
    name: 'Coração com Laço',
    keywords: ['coração laço', 'presente', 'amor', 'gift'],
    category: 'symbols',
    unicode: 'U+1F49D',
    shortcode: ':gift_heart:'
  },
  {
    emoji: '💟',
    name: 'Decoração de Coração',
    keywords: ['decoração coração', 'amor', 'ornamento', 'símbolo'],
    category: 'symbols',
    unicode: 'U+1F49F',
    shortcode: ':heart_decoration:'
  },

  // Emojis de Conspiração (Categoria Especial)
  {
    emoji: '👁️',
    name: 'Olho',
    keywords: ['olho', 'vigilância', 'observando', 'conspiração', 'illuminati'],
    category: 'conspiracy',
    unicode: 'U+1F441',
    shortcode: ':eye:'
  },
  {
    emoji: '🛸',
    name: 'Disco Voador',
    keywords: ['ovni', 'ufo', 'alienígena', 'extraterrestre', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F6F8',
    shortcode: ':flying_saucer:'
  },
  {
    emoji: '👽',
    name: 'Alienígena',
    keywords: ['alienígena', 'extraterrestre', 'et', 'verde', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F47D',
    shortcode: ':alien:'
  },
  {
    emoji: '🔺',
    name: 'Triângulo Vermelho',
    keywords: ['triângulo', 'illuminati', 'pirâmide', 'conspiração', 'símbolo'],
    category: 'conspiracy',
    unicode: 'U+1F53A',
    shortcode: ':small_red_triangle:'
  },
  {
    emoji: '📡',
    name: 'Antena Parabólica',
    keywords: ['antena', 'comunicação', 'sinal', 'transmissão', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F4E1',
    shortcode: ':satellite:'
  },
  {
    emoji: '🔍',
    name: 'Lupa',
    keywords: ['lupa', 'investigação', 'busca', 'descoberta', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F50D',
    shortcode: ':mag:'
  },
  {
    emoji: '📜',
    name: 'Pergaminho',
    keywords: ['pergaminho', 'documento', 'segredo', 'antigo', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F4DC',
    shortcode: ':scroll:'
  },
  {
    emoji: '🗝️',
    name: 'Chave Antiga',
    keywords: ['chave', 'segredo', 'mistério', 'acesso', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F5DD',
    shortcode: ':old_key:'
  },
  {
    emoji: '🔐',
    name: 'Cadeado com Chave',
    keywords: ['cadeado', 'chave', 'segurança', 'proteção', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F510',
    shortcode: ':closed_lock_with_key:'
  },
  {
    emoji: '🎭',
    name: 'Máscaras de Teatro',
    keywords: ['máscaras', 'teatro', 'disfarce', 'identidade', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F3AD',
    shortcode: ':performing_arts:'
  },
  {
    emoji: '🌙',
    name: 'Lua Crescente',
    keywords: ['lua', 'noite', 'mistério', 'oculto', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F319',
    shortcode: ':crescent_moon:'
  },
  {
    emoji: '⚡',
    name: 'Raio',
    keywords: ['raio', 'energia', 'poder', 'força', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+26A1',
    shortcode: ':zap:'
  },
  {
    emoji: '🔥',
    name: 'Fogo',
    keywords: ['fogo', 'quente', 'intenso', 'paixão', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F525',
    shortcode: ':fire:'
  },
  {
    emoji: '💥',
    name: 'Explosão',
    keywords: ['explosão', 'boom', 'impacto', 'choque', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F4A5',
    shortcode: ':boom:'
  },
  {
    emoji: '🌟',
    name: 'Estrela Brilhante',
    keywords: ['estrela', 'brilho', 'especial', 'destaque', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F31F',
    shortcode: ':star2:'
  },
  {
    emoji: '🔮',
    name: 'Bola de Cristal',
    keywords: ['cristal', 'futuro', 'previsão', 'místico', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F52E',
    shortcode: ':crystal_ball:'
  },
  {
    emoji: '🧿',
    name: 'Olho Turco',
    keywords: ['olho turco', 'proteção', 'amuleto', 'místico', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F9FF',
    shortcode: ':nazar_amulet:'
  },
  {
    emoji: '⚠️',
    name: 'Aviso',
    keywords: ['aviso', 'perigo', 'atenção', 'cuidado', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+26A0',
    shortcode: ':warning:'
  },
  {
    emoji: '🚨',
    name: 'Sirene',
    keywords: ['sirene', 'alerta', 'emergência', 'perigo', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F6A8',
    shortcode: ':rotating_light:'
  },
  {
    emoji: '📊',
    name: 'Gráfico de Barras',
    keywords: ['gráfico', 'dados', 'estatística', 'análise', 'conspiração'],
    category: 'conspiracy',
    unicode: 'U+1F4CA',
    shortcode: ':bar_chart:'
  }
];

// Função para buscar emojis
export function searchEmojis(query: string, category?: EmojiCategory): EmojiData[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return category ? EMOJI_DATABASE.filter(emoji => emoji.category === category) : EMOJI_DATABASE;
  }

  return EMOJI_DATABASE.filter(emoji => {
    const matchesCategory = !category || emoji.category === category;
    const matchesSearch = 
      emoji.name.toLowerCase().includes(searchTerm) ||
      emoji.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
      emoji.shortcode.toLowerCase().includes(searchTerm);
    
    return matchesCategory && matchesSearch;
  });
}

// Função para obter emojis por categoria
export function getEmojisByCategory(category: EmojiCategory): EmojiData[] {
  return EMOJI_DATABASE.filter(emoji => emoji.category === category);
}

// Função para obter emoji por shortcode
export function getEmojiByShortcode(shortcode: string): EmojiData | undefined {
  return EMOJI_DATABASE.find(emoji => emoji.shortcode === shortcode);
}

// Função para obter emojis com tons de pele
export function getEmojiWithSkinTone(emoji: EmojiData, skinTone?: keyof typeof SKIN_TONES): string {
  if (!emoji.skinTones || !skinTone) {
    return emoji.emoji;
  }
  
  const skinToneIndex = Object.keys(SKIN_TONES).indexOf(skinTone);
  return emoji.skinTones[skinToneIndex] || emoji.emoji;
}

// Função para obter emojis recentes (simulado - em produção viria do localStorage)
export function getRecentEmojis(): EmojiData[] {
  // Em uma implementação real, isso viria do localStorage
  return EMOJI_DATABASE.slice(0, 20);
}

// Função para obter emojis favoritos (simulado - em produção viria do localStorage)
export function getFavoriteEmojis(): EmojiData[] {
  // Em uma implementação real, isso viria do localStorage
  return EMOJI_DATABASE.filter(emoji => 
    ['👍', '❤️', '😂', '🔥', '👁️', '🛸', '💡'].includes(emoji.emoji)
  );
}