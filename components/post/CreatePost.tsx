import React, { useState, useRef } from 'react';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import { Icon } from '../icons/Icon';
import { Poll, PollOption, User } from '../../types';

const ImageIcon = () => <Icon><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></Icon>;
const VideoIcon = () => <Icon><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></Icon>;
const PollIcon = () => <Icon><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></Icon>;
const SmileIcon = () => <Icon><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></Icon>;
const XIcon = () => <Icon className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;
const AiWriteIcon = () => <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m12 12-1.5 3L9 12l-3 1.5L9 15l1.5 3L12 15l3-1.5-1.5-3z"/></Icon>;
const AiImageIcon = () => <Icon><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="m18 3 1.5 3L21 7.5l-3 1.5L16.5 12l-1.5-3L12 7.5l3-1.5z"/></Icon>;

interface CreatePostProps {
  onAddPost: (text: string, imageUrl?: string, videoUrl?: string, poll?: Poll) => void;
  user: User;
}

const CreatePost: React.FC<CreatePostProps> = ({ onAddPost, user }) => {
  const [text, setText] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'poll' | null>(null);
  
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDays, setPollDays] = useState(1);
  const [pollHours, setPollHours] = useState(0);
  const [pollMinutes, setPollMinutes] = useState(0);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAssistant, setShowAssistant] = useState<'text' | 'image' | false>(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const EMOJIS = ['👍', '🔥', '🤔', '😂', '💡', '🤯', '👽', '🛸', '👁️', '📜', '📡', '💥'];

  const resetState = () => {
    setText('');
    setMediaType(null);
    setImageUrl(undefined);
    setVideoUrl(undefined);
    setPollOptions(['', '']);
    setPollDays(1);
    setPollHours(0);
    setPollMinutes(0);
    setShowEmojiPicker(false);
    setShowAssistant(false);
    setAssistantPrompt('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };
  
  const handlePost = () => {
    let poll: Poll | undefined = undefined;
    if (mediaType === 'poll') {
      const validOptions = pollOptions.map(opt => opt.trim()).filter(opt => opt.length > 0);
      if (validOptions.length < 2) {
        alert('Please provide at least two options for the poll.');
        return;
      }
      
      const now = new Date();
      const endDate = new Date(now.getTime() + (pollDays * 86400000) + (pollHours * 3600000) + (pollMinutes * 60000));

      poll = { 
        options: validOptions.map(opt => ({ text: opt, votes: 0 })),
        endDate: endDate.toISOString()
      };
    }

    onAddPost(text, imageUrl, videoUrl, poll);
    resetState();
  };

  const handleMediaButtonClick = (type: 'image' | 'video' | 'poll') => {
    if (mediaType && mediaType !== type) return;

    if (type === 'image') imageInputRef.current?.click();
    if (type === 'video') videoInputRef.current?.click();
    if (type === 'poll') {
      setMediaType('poll');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      const randomId = Math.floor(Math.random() * 1000);
      if (type === 'image') {
        setImageUrl(`https://picsum.photos/seed/${randomId}/600/400`);
        setMediaType('image');
      } else {
        setVideoUrl('https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4');
        setMediaType('video');
      }
    }
  };

  const handleRemoveMedia = () => {
    setMediaType(null);
    setImageUrl(undefined);
    setVideoUrl(undefined);
    setPollOptions(['','']);
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

  const handleGenerate = (type: 'text' | 'image') => {
    if (!assistantPrompt.trim()) return;
    setIsGenerating(true);

    // --- MOCK API CALL ---
    setTimeout(() => {
      if (type === 'text') {
        const prompts = [
            `Have you considered the connection between "${assistantPrompt}" and the recent solar flares? The official narrative doesn't add up. They're hiding something big, and it's all connected. #FollowTheClues`,
            `Sources tell me that "${assistantPrompt}" is just the tip of the iceberg. It's a distraction from the real operation. Look deeper, question everything. The truth is out there, but not where they want you to look. #TheGreatAwakening`,
            `The declassified documents on "${assistantPrompt}" are heavily redacted for a reason. What are they trying to conceal? It points to a cover-up of massive proportions. We need to demand transparency. #HiddenTruth`
        ];
        const generatedText = prompts[Math.floor(Math.random() * prompts.length)];
        setText(prev => prev ? `${prev}\n\n${generatedText}` : generatedText);
      } else { // image
        const seed = assistantPrompt.split(' ').join('-') + `-${Date.now()}`;
        setImageUrl(`https://picsum.photos/seed/${seed}/600/400`);
        setMediaType('image');
      }
      setIsGenerating(false);
      setShowAssistant(false);
      setAssistantPrompt('');
    }, 1500);
  };

  const isPostDisabled = !text.trim() && !mediaType;

  return (
    <Card className="mb-6">
      <div className="flex space-x-4">
        <Avatar src={user.avatarUrl} alt={user.name} size="md" />
        <div className="w-full">
          <textarea
            id="create-post-textarea"
            ref={textareaRef}
            placeholder="Que verdade você descobriu?"
            className="w-full bg-transparent p-2 border-b border-light-border dark:border-dark-border focus:outline-none resize-none text-lg"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          {showAssistant && (
            <div className="mt-2 p-2 bg-light-bg dark:bg-dark-bg rounded-lg">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{showAssistant === 'text' ? 'Truth Weaver AI Assistant' : 'AI Image Generator'}</label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  placeholder={showAssistant === 'text' ? "e.g., 'structures on Mars'" : "e.g., 'a mysterious monolith in the desert'"}
                  value={assistantPrompt}
                  onChange={(e) => setAssistantPrompt(e.target.value)}
                  className="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={() => handleGenerate(showAssistant)} disabled={isGenerating} className="bg-primary text-white px-3 py-1 rounded-md font-semibold disabled:bg-gray-400">
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          )}

          {mediaType === 'image' && imageUrl && (
            <div className="mt-2 relative">
                <img src={imageUrl} alt="preview" className="rounded-lg max-h-80 w-full object-cover mt-1" />
                <button onClick={handleRemoveMedia} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><XIcon/></button>
            </div>
          )}
          {mediaType === 'video' && videoUrl && (
            <div className="mt-2 relative">
                <video src={videoUrl} controls className="rounded-lg w-full mt-1" />
                <button onClick={handleRemoveMedia} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"><XIcon/></button>
            </div>
          )}
          {mediaType === 'poll' && (
             <div className="mt-3 space-y-3">
                <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => updatePollOption(index, e.target.value)}
                                className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {pollOptions.length > 2 && <button onClick={() => removePollOption(index)} className="p-1 text-gray-500 hover:text-red-500"><XIcon/></button>}
                        </div>
                    ))}
                    {pollOptions.length < 4 && <button onClick={addPollOption} className="text-sm text-primary font-semibold">Add option</button>}
                </div>

                <div className="pt-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Poll duration</p>
                    <div className="flex items-center space-x-2">
                        <div className="flex-1">
                            <label htmlFor="poll-days" className="block text-xs text-gray-500">Days</label>
                            <input type="number" id="poll-days" value={pollDays} onChange={e => setPollDays(Math.min(7, Math.max(0, parseInt(e.target.value) || 0)))} min="0" max="7" className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="poll-hours" className="block text-xs text-gray-500">Hours</label>
                            <input type="number" id="poll-hours" value={pollHours} onChange={e => setPollHours(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))} min="0" max="23" className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="poll-minutes" className="block text-xs text-gray-500">Minutes</label>
                            <input type="number" id="poll-minutes" value={pollMinutes} onChange={e => setPollMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} min="0" max="59" className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                    </div>
                </div>
             </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-2">
             <div className="flex items-center space-x-1 relative text-gray-500 dark:text-gray-400">
                <button onClick={() => handleMediaButtonClick('image')} disabled={!!mediaType && mediaType !== 'image'} className="p-2 hover:text-blue-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Add image">
                    <ImageIcon />
                </button>
                 <button onClick={() => handleMediaButtonClick('video')} disabled={!!mediaType && mediaType !== 'video'} className="p-2 hover:text-green-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Add video">
                    <VideoIcon />
                </button>
                 <button onClick={() => handleMediaButtonClick('poll')} disabled={!!mediaType && mediaType !== 'poll'} className="p-2 hover:text-orange-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Add poll">
                    <PollIcon />
                </button>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:text-yellow-500 rounded-full" aria-label="Add emoji">
                    <SmileIcon />
                </button>
                <button onClick={() => setShowAssistant(showAssistant === 'text' ? false : 'text')} disabled={!!mediaType} className="p-2 hover:text-purple-500 rounded-full disabled:opacity-50" aria-label="AI Assistant">
                    <AiWriteIcon />
                </button>
                <button onClick={() => setShowAssistant(showAssistant === 'image' ? false : 'image')} disabled={!!mediaType && mediaType !== 'image'} className="p-2 hover:text-purple-500 rounded-full disabled:opacity-50" aria-label="Generate Image">
                    <AiImageIcon />
                </button>
                {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg p-2 flex flex-wrap w-48 z-10">
                        {EMOJIS.map(emoji => (
                            <button key={emoji} onClick={() => handleEmojiSelect(emoji)} className="text-xl p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">{emoji}</button>
                        ))}
                    </div>
                )}
                <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" accept="image/*" />
                <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" accept="video/*" />
             </div>
            <button 
              onClick={handlePost}
              disabled={isPostDisabled}
              className="bg-primary hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
              Postar
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreatePost;