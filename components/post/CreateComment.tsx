import React, { useState, useRef } from 'react';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import { User } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import Tooltip from '../common/Tooltip';
import MentionSuggestions from '@/src/components/common/MentionSuggestions';
import EmojiStickerPicker from '@/src/components/EmojiStickerPicker';
import { useEmojiSticker } from '@/src/hooks/useEmojiSticker';
import { EmojiData } from '@/src/data/emojis';
import { StickerData } from '@/src/data/stickers';

const ImageIcon = () => <Icon><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></Icon>;
const SmileIcon = () => <Icon><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></Icon>;
const XIcon = () => <Icon className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

interface CreateCommentProps {
  user: User;
  postId: string;
  onAddComment: (postId: string, commentText: string, imageUrl?: string, parentCommentId?: string) => void;
  parentCommentId?: string;
  onCancelReply?: () => void;
  replyingToUsername?: string; // Nova propriedade
  allUsers: User[];
}

const CreateComment: React.FC<CreateCommentProps> = ({ user, postId, onAddComment, parentCommentId, onCancelReply, replyingToUsername, allUsers }) => {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isFocused, setIsFocused] = useState(!!parentCommentId);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addToast } = useToast();

  // Hook para gerenciar emojis e figurinhas
  const {
    recentEmojis,
    recentStickers,
    favoriteEmojis,
    favoriteStickers,
    preferences,
    addToRecentEmojis,
    addToRecentStickers
  } = useEmojiSticker();

  const resetState = () => {
    setText('');
    setImageUrl(undefined);
    setIsFocused(!!parentCommentId);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (onCancelReply) onCancelReply();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl) return;
    onAddComment(postId, text, imageUrl, parentCommentId);
    resetState();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione um arquivo de imagem.', 'error');
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/comments/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('posts-media').upload(filePath, file);

    if (uploadError) {
      // Error log removed for production
      addToast('Falha ao enviar imagem. Tente novamente.', 'error');
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('posts-media').getPublicUrl(filePath);

    if (data.publicUrl) {
      setImageUrl(data.publicUrl);
    } else {
      addToast('Não foi possível obter o URL da imagem.', 'error');
    }
    setIsUploading(false);
  };

  // Handlers para o novo sistema de emojis e figurinhas
  const handleEmojiSelect = (emojiData: EmojiData) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newText = text.substring(0, start) + emojiData.emoji + text.substring(end);
      setText(newText);
      textareaRef.current.focus();
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
      }, 0);
      
      // Adicionar aos recentes
      addToRecentEmojis(emojiData);
      setShowEmojiPicker(false);
    }
  };

  const handleStickerSelect = (stickerData: StickerData) => {
    // Para stickers, vamos adicionar como uma referência especial no texto
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const stickerRef = `[sticker:${stickerData.id}]`;
      const newText = text.substring(0, start) + stickerRef + text.substring(end);
      setText(newText);
      textareaRef.current.focus();
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(start + stickerRef.length, start + stickerRef.length);
      }, 0);
      
      // Adicionar aos recentes
      addToRecentStickers(stickerData);
      setShowEmojiPicker(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newText.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      setMentionSuggestions(
        allUsers.filter(u => u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query)).slice(0, 5)
      );
    } else {
      setMentionQuery(null);
      setMentionSuggestions([]);
    }
  };

  const handleMentionSelect = (selectedUser: User) => {
    if (textareaRef.current) {
      const currentText = text;
      const cursorPos = textareaRef.current.selectionStart;
      const textBeforeCursor = currentText.substring(0, cursorPos);
      
      const mentionStartIndex = textBeforeCursor.lastIndexOf('@');
      
      if (mentionStartIndex !== -1) {
        const newText = 
          currentText.substring(0, mentionStartIndex) + 
          `@${selectedUser.username} ` + 
          currentText.substring(cursorPos);
        
        setText(newText);
        
        const newCursorPos = mentionStartIndex + selectedUser.username.length + 2;
        setTimeout(() => {
          textareaRef.current?.focus();
          textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
    setMentionQuery(null);
    setMentionSuggestions([]);
  };

  const isSubmitDisabled = (!text.trim() && !imageUrl) || isUploading;

  return (
    <div className="flex items-start space-x-3">
      <Avatar src={user.avatarUrl} alt={user.name} size="sm" userId={user.id} showStatus={true} />
      <div className="flex-1 relative">
        {mentionQuery !== null && (
          <MentionSuggestions users={mentionSuggestions} onSelect={handleMentionSelect} />
        )}
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            placeholder={replyingToUsername ? `Replying to @${replyingToUsername}` : "Post your reply"}
            value={text}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={isFocused ? 3 : 1}
          />

          {imageUrl && (
            <div className="mt-2 relative w-32 h-32">
              <img src={imageUrl} alt="preview" className="rounded-lg h-full w-full object-cover" />
              <button onClick={() => setImageUrl(undefined)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><XIcon /></button>
            </div>
          )}

          {isFocused && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1 relative text-gray-500 dark:text-gray-400">
                <input type="file" ref={imageInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                <Tooltip text="Imagem">
                  <button type="button" onClick={() => imageInputRef.current?.click()} disabled={!!imageUrl || isUploading} className="p-2 hover:text-blue-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div> : <ImageIcon />}
                  </button>
                </Tooltip>
                <Tooltip text="Emoji">
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:text-yellow-500 rounded-full"><SmileIcon /></button>
                </Tooltip>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 z-10">
                    <EmojiStickerPicker
                      onEmojiSelect={handleEmojiSelect}
                      onStickerSelect={handleStickerSelect}
                      onClose={() => setShowEmojiPicker(false)}
                      recentEmojis={recentEmojis}
                      recentStickers={recentStickers}
                      favoriteEmojis={favoriteEmojis}
                      favoriteStickers={favoriteStickers}
                      preferences={{
                        skinTone: preferences.defaultSkinTone,
                        enableAnimations: preferences.showAnimatedStickers,
                        autoSave: preferences.autoSaveRecents
                      }}
                      enableVirtualization={true}
                      enableOptimizations={true}
                      enableAutoUpdate={true}
                      showUpdateNotifications={true}
                      maxHeight={300}
                      theme="dark"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {onCancelReply && <button type="button" onClick={onCancelReply} className="text-sm font-bold py-2 px-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>}
                <button type="submit" disabled={isSubmitDisabled} className="bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Reply
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default React.memo(CreateComment);