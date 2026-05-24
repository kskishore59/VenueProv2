import { useState, useEffect, useRef } from 'react';
import { MessageSquarePlus, X, Send, Check } from 'lucide-react';
import { useDataStore } from '@/stores/data-store';
import { cn } from '@/lib/utils';

type FeedbackCategory = 'bug' | 'feature_request' | 'design' | 'other';

const emojiScale = [
  { rating: 1, char: '😠', label: 'Terrible' },
  { rating: 2, char: '🙁', label: 'Bad' },
  { rating: 3, char: '😐', label: 'Okay' },
  { rating: 4, char: '🙂', label: 'Good' },
  { rating: 5, char: '😍', label: 'Love it!' },
];

const categoryPills: { value: FeedbackCategory; label: string; icon: string }[] = [
  { value: 'bug', label: 'Report a Bug', icon: '🐛' },
  { value: 'feature_request', label: 'Suggest Idea', icon: '💡' },
  { value: 'design', label: 'Design Issue', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '💬' },
];

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState<FeedbackCategory>('feature_request');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = useDataStore((s) => s.submitFeedback);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === null || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await submitFeedback({ rating, category, message });
      setSubmitted(true);
      // Reset form fields
      setRating(null);
      setCategory('feature_request');
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Timeout to reset state after transition
    setTimeout(() => {
      setSubmitted(false);
    }, 200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print" ref={widgetRef}>
      {/* Popover Feedback Card */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-gray-150 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 animate-fade-in z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Share Feedback</h3>
              <p className="text-[11px] text-gray-400 font-medium">Help us shape VenuePro register</p>
            </div>
            <button 
              onClick={handleClose} 
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emoji Ratings */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  How was your experience?
                </label>
                <div className="flex justify-between items-center py-1">
                  {emojiScale.map((item) => (
                    <button
                      key={item.rating}
                      type="button"
                      onClick={() => setRating(item.rating)}
                      className={cn(
                        "w-11 h-11 rounded-xl text-2xl flex items-center justify-center transition-all duration-250 relative group",
                        rating === item.rating 
                          ? "bg-brand-50 border-2 border-brand-500 scale-110 shadow-xs" 
                          : "hover:bg-gray-100 hover:scale-105 active:scale-95"
                      )}
                      title={item.label}
                    >
                      <span>{item.char}</span>
                      {/* Micro tooltip label */}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded bg-gray-900 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-10">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  What is this about?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryPills.map((pill) => (
                    <button
                      key={pill.value}
                      type="button"
                      onClick={() => setCategory(pill.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl text-left text-xs transition-all border border-gray-100 font-semibold",
                        category === pill.value
                          ? "bg-brand-50 border-brand-200 text-brand-700 shadow-3xs"
                          : "bg-white hover:bg-gray-50 text-gray-500"
                      )}
                    >
                      <span>{pill.icon}</span>
                      <span>{pill.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Message */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Describe in details
                </label>
                <div className="relative">
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                    placeholder={
                      category === 'bug' 
                        ? 'What went wrong? Steps to reproduce?' 
                        : 'Describe your idea or what we can do better...'
                    }
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none leading-relaxed placeholder-gray-400"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[9px] font-bold text-gray-400">
                    {message.length} / 500
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={rating === null || !message.trim() || isSubmitting}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs active:scale-[0.98]",
                  rating === null || !message.trim() 
                    ? "bg-gray-300 cursor-not-allowed opacity-75"
                    : "bg-brand-600 hover:bg-brand-700 shadow-sm"
                )}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // Success Screen
            <div className="py-8 text-center flex flex-col items-center justify-center gap-4 animate-scale-up">
              <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center shadow-3xs animate-bounce-soft">
                <Check className="w-6 h-6 text-success-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900">Feedback Submitted!</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                  Thank you for helping us refine VenuePro. We review every single recommendation.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
              >
                Close Panel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all group duration-300 relative",
          isOpen && "rotate-90 bg-rose-500 from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600"
        )}
        title="Send Feedback"
      >
        {isOpen ? (
          <X className="w-5.5 h-5.5 text-white" />
        ) : (
          <>
            <MessageSquarePlus className="w-5.5 h-5.5 text-white" />
            {/* Tooltip on hover */}
            <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-gray-900 text-xs font-bold text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap translate-x-2 group-hover:translate-x-0 transition-transform">
              Feedback
            </span>
          </>
        )}
      </button>
    </div>
  );
}
