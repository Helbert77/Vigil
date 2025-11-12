import React, { useEffect, useRef, useState } from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

// Categorias de emojis organizadas logicamente
const EMOJI_CATEGORIES = {
  frequent: {
    name: 'Frequentes',
    icon: '🕒',
    emojis: ['😀', '😊', '😂', '❤️', '👍', '👏', '🔥', '✨', '💯', '🎉', '👀', '💪', '🤔', '😅', '😍', '🙏']
  },
  smileys: {
    name: 'Rostos & Emoções',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓']
  },
  gestures: {
    name: 'Gestos',
    icon: '👍',
    emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '🦶', '🦵', '🦿', '👄', '🦷', '👅', '👂', '🦻', '👃', '👣', '👁️', '👀', '🫀', '🫁', '🧠', '🗣️', '👤', '👥', '🫂']
  },
  animals: {
    name: 'Animais & Natureza',
    icon: '🐶',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐈', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔']
  },
  food: {
    name: 'Comidas',
    icon: '🍕',
    emojis: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🫘', '🌰', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯']
  },
  activities: {
    name: 'Atividades',
    icon: '⚽',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩']
  },
  travel: {
    name: 'Viagens',
    icon: '✈️',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋']
  },
  objects: {
    name: 'Objetos',
    icon: '💡',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '🪪', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧']
  },
  symbols: {
    name: 'Símbolos',
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🛗', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '🟰', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛']
  },
  flags: {
    name: 'Bandeiras',
    icon: '🏁',
    emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿', '🇩🇪', '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷', '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵', '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾', '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇳', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺', '🇼🇫', '🇼🇸', '🇽🇰', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿']
  }
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose, buttonRef }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('frequent');
  const [searchTerm, setSearchTerm] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Não fechar se clicar no botão que abre o picker
      if (buttonRef?.current?.contains(target)) {
        return;
      }
      
      // Fechar se clicar fora do picker
      if (pickerRef.current && !pickerRef.current.contains(target)) {
        onClose();
      }
    };

    // Adicionar listener após um pequeno delay para evitar fechamento imediato
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, buttonRef]);

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focar no input de busca ao abrir
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Mapa de nomes de emojis para busca
  const emojiNames: Record<string, string[]> = {
    '😀': ['sorriso', 'feliz', 'smile', 'happy'],
    '😃': ['sorriso', 'feliz', 'smile', 'happy', 'alegre'],
    '😄': ['sorriso', 'feliz', 'smile', 'happy', 'alegre'],
    '😁': ['sorriso', 'dentes', 'feliz', 'grin'],
    '😅': ['suor', 'nervoso', 'sweat', 'smile'],
    '😂': ['rindo', 'chorando', 'laugh', 'tears', 'joy'],
    '🤣': ['rindo', 'rolling', 'laugh'],
    '😊': ['sorriso', 'feliz', 'blush', 'smile'],
    '😇': ['anjo', 'inocente', 'angel', 'halo'],
    '🙂': ['sorriso', 'smile'],
    '🙃': ['invertido', 'upside', 'down'],
    '😉': ['piscada', 'wink'],
    '😌': ['aliviado', 'relieved', 'calm'],
    '😍': ['amor', 'apaixonado', 'love', 'heart', 'eyes'],
    '🥰': ['amor', 'corações', 'love', 'hearts'],
    '😘': ['beijo', 'kiss'],
    '❤️': ['amor', 'coração', 'love', 'heart', 'red'],
    '🧡': ['laranja', 'coração', 'orange', 'heart'],
    '💛': ['amarelo', 'coração', 'yellow', 'heart'],
    '💚': ['verde', 'coração', 'green', 'heart'],
    '💙': ['azul', 'coração', 'blue', 'heart'],
    '💜': ['roxo', 'coração', 'purple', 'heart'],
    '🖤': ['preto', 'coração', 'black', 'heart'],
    '🤍': ['branco', 'coração', 'white', 'heart'],
    '👍': ['positivo', 'joinha', 'like', 'thumbs', 'up'],
    '👎': ['negativo', 'thumbs', 'down'],
    '👏': ['palmas', 'clap', 'applause'],
    '🙏': ['oração', 'obrigado', 'pray', 'thanks'],
    '💪': ['força', 'músculo', 'strong', 'muscle'],
    '🔥': ['fogo', 'fire', 'quente', 'hot'],
    '✨': ['brilho', 'estrelas', 'sparkles'],
    '💯': ['cem', 'hundred', '100'],
    '🎉': ['festa', 'celebração', 'party', 'celebration'],
    '👀': ['olhos', 'eyes', 'looking'],
    '🤔': ['pensando', 'thinking', 'hmm'],
    '😢': ['triste', 'chorando', 'sad', 'crying'],
    '😭': ['chorando', 'muito', 'crying', 'loudly'],
    '😡': ['raiva', 'bravo', 'angry', 'mad'],
    '😱': ['medo', 'chocado', 'scared', 'shocked'],
    '🤯': ['mente', 'explodindo', 'mind', 'blown'],
    '🥳': ['festa', 'party', 'celebration'],
    '😎': ['legal', 'óculos', 'cool', 'sunglasses'],
    '🤓': ['nerd', 'inteligente', 'geek', 'smart'],
    '🤩': ['estrelas', 'olhos', 'star', 'struck'],
    '🐶': ['cachorro', 'dog', 'pet'],
    '🐱': ['gato', 'cat', 'pet'],
    '🐭': ['rato', 'mouse'],
    '🐹': ['hamster'],
    '🐰': ['coelho', 'rabbit', 'bunny'],
    '🦊': ['raposa', 'fox'],
    '🐻': ['urso', 'bear'],
    '🐼': ['panda'],
    '🐨': ['coala', 'koala'],
    '🐯': ['tigre', 'tiger'],
    '🦁': ['leão', 'lion'],
    '🍕': ['pizza'],
    '🍔': ['hambúrguer', 'burger', 'hamburger'],
    '🍟': ['batata', 'frita', 'fries'],
    '🌭': ['cachorro', 'quente', 'hot', 'dog'],
    '🍿': ['pipoca', 'popcorn'],
    '🍦': ['sorvete', 'ice', 'cream'],
    '🍰': ['bolo', 'cake'],
    '🎂': ['aniversário', 'bolo', 'birthday', 'cake'],
    '🍺': ['cerveja', 'beer'],
    '☕': ['café', 'coffee'],
    '🚗': ['carro', 'car'],
    '✈️': ['avião', 'airplane', 'plane'],
    '🚀': ['foguete', 'rocket', 'space'],
    '🏠': ['casa', 'home', 'house'],
    '⚽': ['futebol', 'soccer', 'football'],
    '🏀': ['basquete', 'basketball'],
    '🎮': ['jogo', 'video', 'game', 'gaming'],
    '🎵': ['música', 'music', 'note'],
    '🎸': ['guitarra', 'guitar'],
    '📱': ['celular', 'telefone', 'phone', 'mobile'],
    '💻': ['computador', 'computer', 'laptop'],
    '⌚': ['relógio', 'watch', 'time'],
    '📷': ['câmera', 'camera', 'foto', 'photo'],
    '💡': ['lâmpada', 'ideia', 'light', 'bulb', 'idea'],
    '🔔': ['sino', 'notificação', 'bell', 'notification'],
    '🇧🇷': ['brasil', 'brazil', 'bandeira', 'flag'],
    '🇺🇸': ['estados', 'unidos', 'usa', 'america'],
    '⭐': ['estrela', 'star'],
    '🌟': ['estrela', 'brilhante', 'star', 'glowing'],
    '🌙': ['lua', 'moon'],
    '☀️': ['sol', 'sun'],
    '⚡': ['raio', 'lightning', 'thunder'],
    '🌈': ['arco', 'íris', 'rainbow'],
    '✅': ['check', 'correto', 'ok', 'done'],
    '❌': ['erro', 'errado', 'x', 'wrong', 'no'],
    '⚠️': ['aviso', 'warning', 'attention'],
    '🆗': ['ok', 'okay'],
    '🆘': ['socorro', 'help', 'sos'],
  };

  // Filtrar emojis por busca
  const getDisplayedEmojis = () => {
    const currentEmojis = EMOJI_CATEGORIES[activeCategory].emojis;
    
    if (!searchTerm.trim()) {
      return currentEmojis;
    }

    const term = searchTerm.toLowerCase().trim();
    
    // Buscar em todas as categorias se houver termo de busca
    const allEmojis = Object.values(EMOJI_CATEGORIES).flatMap(cat => cat.emojis);
    
    // Filtrar por correspondência de nome
    return allEmojis.filter((emoji, index, self) => {
      // Remove duplicatas
      if (self.indexOf(emoji) !== index) return false;
      
      // Verifica se o emoji tem correspondência no mapa de nomes
      const names = emojiNames[emoji] || [];
      return names.some(name => name.includes(term));
    });
  };

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  const displayedEmojis = getDisplayedEmojis();

  return (
    <div ref={pickerRef} className="emoji-picker-container">
      <div className="emoji-picker">
        {/* Header com busca */}
        <div className="emoji-picker-header">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar emojis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="emoji-search-input"
          />
          <button 
            onClick={onClose}
            className="emoji-close-button"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Categorias */}
        {!searchTerm && (
          <div className="emoji-categories">
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                className={`emoji-category-btn ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key as keyof typeof EMOJI_CATEGORIES)}
                title={category.name}
                aria-label={category.name}
              >
                {category.icon}
              </button>
            ))}
          </div>
        )}

        {/* Grid de Emojis */}
        <div className="emoji-grid-container">
          {displayedEmojis.length > 0 ? (
            <div className="emoji-grid">
              {displayedEmojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  className="emoji-button"
                  onClick={() => handleEmojiClick(emoji)}
                  title={emoji}
                  aria-label={`Selecionar emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : (
            <div className="emoji-empty-state">
              <p>Nenhum emoji encontrado</p>
            </div>
          )}
        </div>

        {/* Footer com nome da categoria */}
        {!searchTerm && (
          <div className="emoji-picker-footer">
            {EMOJI_CATEGORIES[activeCategory].name}
          </div>
        )}
      </div>

      <style jsx>{`
        .emoji-picker-container {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .emoji-picker {
          width: 352px;
          background: var(--light-card, white);
          border: 1px solid var(--light-border, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        :global(.dark) .emoji-picker {
          background: var(--dark-card, #1f2937);
          border-color: var(--dark-border, #374151);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .emoji-picker-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid var(--light-border, #e5e7eb);
        }

        :global(.dark) .emoji-picker-header {
          border-bottom-color: var(--dark-border, #374151);
        }

        .emoji-search-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--light-border, #e5e7eb);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          background: var(--light-bg, #f9fafb);
          color: var(--light-text, #111827);
        }

        .emoji-search-input:focus {
          border-color: var(--accent-color, #3b82f6);
          background: var(--light-card, white);
        }

        :global(.dark) .emoji-search-input {
          background: var(--dark-bg, #111827);
          border-color: var(--dark-border, #374151);
          color: var(--dark-text, #f3f4f6);
        }

        :global(.dark) .emoji-search-input:focus {
          border-color: var(--accent-color, #1e3a8a);
          background: var(--dark-card, #1f2937);
        }

        .emoji-close-button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 24px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .emoji-close-button:hover {
          background: var(--light-bg, #f3f4f6);
          color: var(--light-text, #111827);
        }

        :global(.dark) .emoji-close-button {
          color: #9ca3af;
        }

        :global(.dark) .emoji-close-button:hover {
          background: var(--dark-border, #374151);
          color: var(--dark-text, #f3f4f6);
        }

        .emoji-categories {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--light-border, #e5e7eb);
          overflow-x: auto;
          scrollbar-width: thin;
        }

        :global(.dark) .emoji-categories {
          border-bottom-color: var(--dark-border, #374151);
        }

        .emoji-categories::-webkit-scrollbar {
          height: 4px;
        }

        .emoji-categories::-webkit-scrollbar-track {
          background: transparent;
        }

        .emoji-categories::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }

        :global(.dark) .emoji-categories::-webkit-scrollbar-thumb {
          background: #4b5563;
        }

        .emoji-category-btn {
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          font-size: 20px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .emoji-category-btn:hover {
          background: var(--light-bg, #f3f4f6);
        }

        .emoji-category-btn.active {
          background: var(--accent-active, #dbeafe);
        }

        :global(.dark) .emoji-category-btn:hover {
          background: var(--dark-border, #374151);
        }

        :global(.dark) .emoji-category-btn.active {
          background: var(--accent-active, #1e3a8a);
        }

        .emoji-grid-container {
          padding: 12px;
          height: 320px;
          overflow-y: auto;
        }

        .emoji-grid-container::-webkit-scrollbar {
          width: 8px;
        }

        .emoji-grid-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .emoji-grid-container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        .emoji-grid-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        :global(.dark) .emoji-grid-container::-webkit-scrollbar-thumb {
          background: #4b5563;
        }

        :global(.dark) .emoji-grid-container::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
        }

        .emoji-button {
          width: 100%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.15s;
          padding: 0;
        }

        .emoji-button:hover {
          background: var(--light-bg, #f3f4f6);
          transform: scale(1.15);
        }

        .emoji-button:active {
          transform: scale(1.05);
        }

        :global(.dark) .emoji-button:hover {
          background: var(--dark-border, #374151);
        }

        .emoji-empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
          font-size: 14px;
        }

        :global(.dark) .emoji-empty-state {
          color: #9ca3af;
        }

        .emoji-picker-footer {
          padding: 8px 12px;
          border-top: 1px solid var(--light-border, #e5e7eb);
          font-size: 12px;
          color: #6b7280;
          text-align: center;
          font-weight: 500;
        }

        :global(.dark) .emoji-picker-footer {
          border-top-color: var(--dark-border, #374151);
          color: #9ca3af;
        }

        /* Responsividade */
        @media (max-width: 640px) {
          .emoji-picker {
            width: 100%;
            max-width: 320px;
          }

          .emoji-grid {
            grid-template-columns: repeat(7, 1fr);
          }

          .emoji-button {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmojiPicker;

