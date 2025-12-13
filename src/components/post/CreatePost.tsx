import React, { useState, useRef, useEffect } from 'react';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import { Icon } from '@/components/icons/Icon';
import { Poll, User, Community, EvidenceItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import Tooltip from '@/components/common/Tooltip';
import MentionSuggestions from '@/src/components/common/MentionSuggestions';
import EmojiPicker from '@/src/components/post/EmojiPicker';
import ResilientVideo from '@/src/components/common/ResilientVideo';
import { getPlanLimits } from '@/src/utils/pricingUtils';

const ImageIcon = () => <Icon><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></Icon>;
const PollIcon = () => <Icon><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></Icon>;
const SmileIcon = () => <Icon><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></Icon>;
const XIcon = () => <Icon className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const ClipboardIcon = () => <Icon><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></Icon>;
const InfoIcon = () => <Icon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></Icon>;

interface CreatePostProps {
  onAddPost: (text: string, imageUrl?: string, videoUrl?: string, audioUrl?: string, poll?: Poll, communityId?: string, evidenceBoard?: EvidenceItem[], media_is_sensitive?: boolean) => void;
  user: User;
  community?: Community;
  allUsers: User[];
  setCurrentPage: (page: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onAddPost, user, community, allUsers, setCurrentPage }) => {
  const [text, setText] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'poll' | 'evidence' | null>(null);
  
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [isSensitive, setIsSensitive] = useState(false);
  
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDays, setPollDays] = useState(1);
  const [pollHours, setPollHours] = useState(0);
  const [pollMinutes, setPollMinutes] = useState(0);

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [postToCommunityOnly, setPostToCommunityOnly] = useState(true);
  
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const { addToast } = useToast();

  const [uploadingEvidenceId, setUploadingEvidenceId] = useState<string | null>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);
  const [currentItemIdForUpload, setCurrentItemIdForUpload] = useState<string | null>(null);

  const EMOJIS = ['👍', '🔥', '🤔', '😂', '💡', '🤯', '👽', '🛸', '👁️', '📜', '📡', '💥'];

  // Usar getPlanLimits para obter o limite de caracteres
  const planLimits = getPlanLimits(user.plan);
  const characterLimit = planLimits.postCharLimit;
  const isOverLimit = text.length > characterLimit;

  useEffect(() => {
    if (community) {
      setPostToCommunityOnly(true);
    }
  }, [community]);

  const resetState = () => {
    setText('');
    setMediaType(null);
    setImageUrl(undefined);
    setVideoUrl(undefined);
    setAudioUrl(undefined);
    setIsSensitive(false);
    setPollOptions(['', '']);
    setPollDays(1);
    setPollHours(0);
    setPollMinutes(0);
    setEvidenceItems([]);
    setShowEmojiPicker(false);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };
  
  const handlePost = () => {
    let poll: Poll | undefined = undefined;
    if (mediaType === 'poll') {
      const validOptions = pollOptions.map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0);
      if (validOptions.length < 2) {
        addToast('Por favor, forneça pelo menos duas opções para a enquete.', 'info');
        return;
      }
      
      const now = new Date();
      const endDate = new Date(now.getTime() + (pollDays * 86400000) + (pollHours * 3600000) + (pollMinutes * 60000));

      poll = { 
        options: validOptions.map((opt: string) => ({ text: opt, votes: 0 })),
        endDate: endDate.toISOString()
      };
    }

    // Quando dentro de uma comunidade:
    // - Se postToCommunityOnly é true (checkbox desmarcado): post fica apenas na comunidade
    // - Se postToCommunityOnly é false (checkbox marcado "Tornar público"): post vai para comunidade E feed geral
    const finalCommunityId = community ? community.id : undefined;

    onAddPost(text, imageUrl, videoUrl, audioUrl, poll, finalCommunityId, mediaType === 'evidence' ? evidenceItems : undefined, isSensitive);
    resetState();
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileMainType = file.type.split('/')[0];
    if (!['image', 'video', 'audio'].includes(fileMainType)) {
        addToast('Tipo de arquivo não suportado. Por favor, selecione uma imagem, vídeo ou áudio.', 'error');
        return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('posts-media')
      .upload(filePath, file);

    if (uploadError) {
      console.error(`Error uploading ${fileMainType}:`, uploadError);
      addToast(`Falha ao enviar ${fileMainType}. Por favor, tente novamente.`, 'error');
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('posts-media')
      .getPublicUrl(filePath);

    if (data.publicUrl) {
        if (fileMainType === 'image') {
            setImageUrl(data.publicUrl);
            setMediaType('image');
        } else if (fileMainType === 'video') {
            setVideoUrl(data.publicUrl);
            setMediaType('video');
        } else if (fileMainType === 'audio') {
            setAudioUrl(data.publicUrl);
            setMediaType('audio');
        }
    } else {
      addToast('Não foi possível obter o URL da mídia após o upload.', 'error');
    }
    setIsUploading(false);
  };

  const handleAttachmentButtonClick = (type: 'media' | 'poll' | 'evidence') => {
    if (mediaType) return;

    if (type === 'media') mediaInputRef.current?.click();
    if (type === 'poll') setMediaType('poll');
    if (type === 'evidence') {
      setMediaType('evidence');
      if (evidenceItems.length === 0) {
        addEvidenceItem();
      }
    }
  };

  const handleRemoveMedia = () => {
    setMediaType(null);
    setImageUrl(undefined);
    setVideoUrl(undefined);
    setAudioUrl(undefined);
    setIsSensitive(false);
    setPollOptions(['','']);
    setEvidenceItems([]);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  
  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const addEvidenceItem = () => {
    setEvidenceItems(prev => [...prev, { id: Date.now().toString(), type: 'text', title: '', content: '' }]);
  };

  const updateEvidenceItem = (id: string, field: keyof EvidenceItem, value: string) => {
    setEvidenceItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeEvidenceItem = (id: string) => {
    setEvidenceItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEvidenceFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentItemIdForUpload) return;

    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    if (!fileType) {
      addToast('Tipo de arquivo não suportado. Por favor, selecione uma imagem ou vídeo.', 'error');
      return;
    }

    setUploadingEvidenceId(currentItemIdForUpload);
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/evidence/${currentItemIdForUpload}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('posts-media')
      .upload(filePath, file);

    if (uploadError) {
      console.error(`Error uploading ${fileType}:`, uploadError);
      addToast(`Falha ao enviar ${fileType}. Tente novamente.`, 'error');
    } else {
      const { data } = supabase.storage
        .from('posts-media')
        .getPublicUrl(filePath);

      if (data.publicUrl) {
        setEvidenceItems(prev => prev.map(item => item.id === currentItemIdForUpload ? { ...item, type: fileType, content: data.publicUrl } : item));
        // Toast removido - arquivo aparece no preview
      } else {
        addToast('Não foi possível obter o URL da mídia.', 'error');
      }
    }
    setUploadingEvidenceId(null);
    setCurrentItemIdForUpload(null);
    if (evidenceFileInputRef.current) evidenceFileInputRef.current.value = '';
  };

  const triggerEvidenceUpload = (itemId: string) => {
    setCurrentItemIdForUpload(itemId);
    evidenceFileInputRef.current?.click();
  };

  const handleEmojiSelect = (emoji: string) => {
    if(textareaRef.current){
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newText = text.substring(0, start) + emoji + text.substring(end);
        setText(newText);
        textareaRef.current.focus();
        setTimeout(() => {
          textareaRef.current?.setSelectionRange(start + emoji.length, start + emoji.length)
        }, 0);
    }
  };


  const filteredMentionSuggestions = React.useMemo(() => {
    if (!mentionQuery) return [];
    return allUsers
      .filter(u => 
        u.username.toLowerCase().includes(mentionQuery.toLowerCase()) || 
        u.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [allUsers, mentionQuery]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newText.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
    } else {
      setMentionQuery(null);
    }
  };

  React.useEffect(() => {
    setMentionSuggestions(filteredMentionSuggestions);
  }, [filteredMentionSuggestions]);

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

  const isPostDisabled = (!text.trim() && !imageUrl && !videoUrl && !audioUrl && !mediaType) || isUploading || isOverLimit;

  return (
    <Card className="mb-6">
      <div className="flex space-x-4">
        <Avatar src={user.avatarUrl} alt={user.name} size="md" />
        <div className="flex-1 relative">
          {mentionQuery !== null && (
            <MentionSuggestions users={mentionSuggestions} onSelect={handleMentionSelect} />
          )}
          <div className="relative">
            <textarea
              id="create-post-textarea"
              ref={textareaRef}
              placeholder="Que verdade você descobriu?"
              className="w-full bg-transparent p-2 focus:outline-none resize-none text-lg"
              rows={3}
              value={text}
              onChange={handleTextChange}
            ></textarea>
          </div>
        </div>
      </div>

      {isOverLimit && (
        <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-start space-x-3">
          <InfoIcon />
          <div>
            <p className="font-semibold text-blue-800 dark:text-blue-200">
              Você excedeu o limite de {characterLimit} caracteres.
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Para criar posts maiores e artigos, considere fazer o upgrade. 
              <button 
                onClick={() => setCurrentPage('Premium')} 
                className="font-bold hover:underline ml-1"
              >
                Faça upgrade para o Premium.
              </button>
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        {isUploading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span>Enviando mídia...</span>
          </div>
        )}

        {(mediaType === 'image' && imageUrl) || (mediaType === 'video' && videoUrl) ? (
          <div className="relative">
              {imageUrl && <img src={imageUrl} alt="preview" className="rounded-lg max-h-80 w-full object-cover mt-1" />}
              {videoUrl && (
                <ResilientVideo src={videoUrl} controls className="rounded-lg w-full mt-1" />
              )}
              <button onClick={handleRemoveMedia} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><XIcon/></button>
              <div className="mt-2 flex items-center">
                  <input
                      type="checkbox"
                      id="sensitive-check"
                      checked={isSensitive}
                      onChange={(e) => setIsSensitive(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="sensitive-check" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Marcar mídia como sensível (ex: violência, conteúdo adulto)
                  </label>
              </div>
          </div>
        ) : null}
        {mediaType === 'audio' && audioUrl && (
          <div className="relative">
              <audio src={audioUrl} controls className="w-full" />
              <button onClick={handleRemoveMedia} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><XIcon/></button>
          </div>
        )}
        {mediaType === 'poll' && (
            <div className="space-y-3">
              <div className="space-y-2">
                  {pollOptions.map((option, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                          <input 
                              type="text" 
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePollOption(index, e.target.value)}
                              className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          {pollOptions.length > 2 && <button onClick={() => removePollOption(index)} className="p-1 text-gray-500 hover:text-red-500"><XIcon/></button>}
                      </div>
                  ))}
                  {pollOptions.length < 4 && <button onClick={addPollOption} className="text-sm text-primary font-semibold">Add option</button>}
              </div>

              <div className="pt-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Poll duration</p>
                  <div className="flex items-center gap-2 mb-2" style={{ maxWidth: '280px' }}>
                      <div className="w-20 flex-shrink-0">
                          <label htmlFor="poll-days" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Days</label>
                          <input type="number" id="poll-days" value={pollDays} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPollDays(Math.min(7, Math.max(0, parseInt(e.target.value) || 0)))} min="0" max="7" className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div className="w-20 flex-shrink-0">
                          <label htmlFor="poll-hours" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hours</label>
                          <input type="number" id="poll-hours" value={pollHours} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPollHours(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))} min="0" max="23" className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div className="w-20 flex-shrink-0">
                          <label htmlFor="poll-minutes" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minutes</label>
                          <input type="number" id="poll-minutes" value={pollMinutes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPollMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} min="0" max="59" className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                  </div>
                  <div className="mt-2">
                      <button 
                        onClick={handleRemoveMedia}
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-md border border-light-border dark:border-dark-border hover:border-red-500 dark:hover:border-red-400"
                        style={{ display: 'inline-flex', visibility: 'visible', opacity: 1 }}
                      >
                        Cancelar Enquete
                      </button>
                  </div>
              </div>
            </div>
        )}
        {mediaType === 'evidence' && (
          <div className="space-y-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
            {evidenceItems.map((item) => (
              <div key={item.id} className="p-3 border border-light-border dark:border-dark-border rounded-md bg-light-card dark:bg-dark-card">
                <div className="flex justify-between items-center mb-2">
                  <select 
                    value={item.type === 'image' || item.type === 'video' ? 'media' : item.type} 
                    onChange={(e) => {
                      const value = e.target.value;
                      const newType = value === 'media' ? 'image' : value;
                      updateEvidenceItem(item.id, 'type', newType as EvidenceItem['type']);
                    }} 
                    className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="text">Texto</option>
                    <option value="media">Mídia</option>
                    <option value="link">Link</option>
                  </select>
                  <button onClick={() => removeEvidenceItem(item.id)} className="text-gray-500 hover:text-red-500"><XIcon /></button>
                </div>
                <input type="text" placeholder="Título da Evidência" value={item.title} onChange={(e) => updateEvidenceItem(item.id, 'title', e.target.value)} className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 mb-2" />
                {item.type === 'text' && (
                  <textarea placeholder="Descreva a evidência..." value={item.content} onChange={(e) => updateEvidenceItem(item.id, 'content', e.target.value)} className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2" rows={3}></textarea>
                )}
                {item.type === 'link' && (
                  <input type="text" placeholder="URL do Link" value={item.content} onChange={(e) => updateEvidenceItem(item.id, 'content', e.target.value)} className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2" />
                )}
                {(item.type === 'image' || item.type === 'video') && (
                  <div>
                    {item.content ? (
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-green-500 truncate flex-1">Mídia carregada: {item.content}</p>
                        <button onClick={() => updateEvidenceItem(item.id, 'content', '')} className="text-red-500 text-sm">Remover</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => triggerEvidenceUpload(item.id)}
                        disabled={uploadingEvidenceId === item.id}
                        className="w-full text-sm bg-primary/10 text-primary font-semibold py-2 rounded-md hover:bg-primary/20 disabled:opacity-50"
                      >
                        {uploadingEvidenceId === item.id ? 'Enviando...' : 'Fazer upload de Mídia'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <button onClick={addEvidenceItem} className="text-sm text-primary font-semibold">+ Adicionar Evidência</button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-light-border dark:border-dark-border px-4">
          <div className="flex items-center space-x-1 relative text-gray-500 dark:text-gray-400 ml-[-30px] md:ml-4">
             <input type="file" ref={mediaInputRef} onChange={handleMediaUpload} style={{ display: 'none' }} accept="image/*,video/*,audio/*" />
             <input
               type="file"
               ref={evidenceFileInputRef}
               onChange={handleEvidenceFileUpload}
               style={{ display: 'none' }}
               accept="image/*,video/*"
             />
             <Tooltip text="Mídia">
               <button onClick={() => handleAttachmentButtonClick('media')} disabled={!!mediaType || isUploading} className="p-2 hover:text-blue-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Add media"><ImageIcon /></button>
             </Tooltip>
             <Tooltip text="Criar enquete">
               <button onClick={() => handleAttachmentButtonClick('poll')} disabled={!!mediaType} className="p-2 hover:text-orange-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Add poll"><PollIcon /></button>
             </Tooltip>
             <Tooltip text="Adicionar quadro de evidências">
               <button onClick={() => handleAttachmentButtonClick('evidence')} disabled={!!mediaType} className="p-2 hover:text-indigo-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Add evidence board"><ClipboardIcon /></button>
             </Tooltip>
             <Tooltip text="Adicionar emoji">
               <div className="relative inline-block">
                 <button 
                   ref={emojiButtonRef}
                   onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                   className="p-2 hover:text-yellow-500 rounded-full" 
                   aria-label="Add emoji"
                 >
                   <SmileIcon />
                 </button>
                 {showEmojiPicker && (
                   <EmojiPicker
                     onEmojiSelect={handleEmojiSelect}
                     onClose={() => setShowEmojiPicker(false)}
                     buttonRef={emojiButtonRef}
                   />
                 )}
               </div>
             </Tooltip>
          </div>
         <div className="flex items-center space-x-3">
             {community && (
               <div className="flex items-center space-x-2 text-sm">
                 <input
                   type="checkbox"
                   id="post-to-community"
                   checked={!postToCommunityOnly}
                   onChange={() => setPostToCommunityOnly(!postToCommunityOnly)}
                   className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                 />
                 <label htmlFor="post-to-community" className="text-gray-600 dark:text-gray-400">
                   Tornar público
                 </label>
               </div>
             )}
              {text.length > 0 && (
                <div className={`text-sm font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                  <span>{characterLimit - text.length}</span>
                </div>
              )}
             <button 
             onClick={handlePost}
             disabled={isPostDisabled}
             className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0">
             Postar
             </button>
         </div>
       </div>
    </Card>
  );
};

export default CreatePost;