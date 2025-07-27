import { lazy, Suspense } from 'react';

// Lazy load heavy components
const EmojiPicker = lazy(() => import('emoji-picker-react'));
const ChatWindow = lazy(() => import('./chat/ChatWindow'));

// Loading fallbacks
const EmojiPickerFallback = () => (
  <div className="w-[300px] h-[400px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ChatWindowFallback = () => (
  <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Wrapped components with Suspense
export const LazyEmojiPicker = (props) => (
  <Suspense fallback={<EmojiPickerFallback />}>
    <EmojiPicker {...props} />
  </Suspense>
);

export const LazyChatWindow = (props) => (
  <Suspense fallback={<ChatWindowFallback />}>
    <ChatWindow {...props} />
  </Suspense>
);
