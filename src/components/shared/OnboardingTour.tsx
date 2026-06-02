import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface Step {
  selector: string;
  title: string;
  description: string;
  position: 'bottom' | 'top' | 'left' | 'right';
}

const steps: Step[] = [
  {
    selector: '#tour-sidebar-nav',
    title: 'Workspace Navigation',
    description: 'Quickly access Bookings, Inquiries (Leads), Payments, Expenses, and Profile settings.',
    position: 'right',
  },
  {
    selector: '#tour-quick-add-btn',
    title: 'Quick Add Booking',
    description: 'Instantly add new bookings or enquiries from anywhere in the app with a single click.',
    position: 'bottom',
  },
  {
    selector: '#tour-notifications-btn',
    title: 'Notifications Panel',
    description: 'Keep track of payment dues, new inquiries, system updates, and automated alerts.',
    position: 'bottom',
  },
  {
    selector: '#tour-sidebar-settings',
    title: 'Workspace Settings',
    description: 'Configure your company details, GST registration, payment terms, and invite your staff.',
    position: 'right',
  },
  {
    selector: '#tour-sidebar-help',
    title: 'Help & Knowledge Base',
    description: 'Access video flows, read FAQs, and check the common blunders list if you get stuck.',
    position: 'right',
  },
];

interface OnboardingTourComponent extends React.FC {
  start: () => void;
}

export const OnboardingTour: OnboardingTourComponent = () => {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const handleStart = () => {
      setStepIndex(0);
      setActive(true);
    };

    window.addEventListener('start-onboarding-tour', handleStart);

    // Auto-start check only for logged-in users on authenticated dashboard pages
    const pathname = window.location.pathname;
    const isPublicOrSetupPage = ['/', '/login', '/signup', '/onboarding'].includes(pathname);

    if (user && !isPublicOrSetupPage) {
      const tourKey = `venuepro_tour_completed_${user.id}`;
      const completed = localStorage.getItem(tourKey) === 'true' || user.user_metadata?.tour_completed === true;
      if (!completed) {
        const timer = setTimeout(() => {
          setActive(true);
        }, 1500);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('start-onboarding-tour', handleStart);
        };
      }
    }

    return () => {
      window.removeEventListener('start-onboarding-tour', handleStart);
    };
  }, [user]);

  const activeStep = steps[stepIndex];

  // Recalculate coordinates of target element
  useEffect(() => {
    if (!active || !activeStep) return;

    const updateCoords = () => {
      const isMobile = window.innerWidth < 768;
      let targetSelector = activeStep.selector;

      if (isMobile) {
        if (targetSelector === '#tour-sidebar-nav') {
          targetSelector = '#tour-mobile-nav';
        } else if (targetSelector === '#tour-quick-add-btn') {
          targetSelector = '#tour-mobile-quick-add';
        } else if (targetSelector === '#tour-sidebar-settings' || targetSelector === '#tour-sidebar-help') {
          targetSelector = '#tour-mobile-settings';
        }
      }

      const el = document.querySelector(targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        setCoords(null);
      }
    };

    // Delay slightly to allow any layout shifts to complete
    const timer = setTimeout(updateCoords, 100);

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [active, stepIndex, activeStep]);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = () => {
    setActive(false);
    if (user) {
      localStorage.setItem(`venuepro_tour_completed_${user.id}`, 'true');
      useAuthStore.getState().updateUserMetadata({ tour_completed: true });
    }
  };

  const handleSkip = () => {
    setActive(false);
    if (user) {
      localStorage.setItem(`venuepro_tour_completed_${user.id}`, 'true');
      useAuthStore.getState().updateUserMetadata({ tour_completed: true });
    }
  };

  if (!active) return null;

  // Render tooltip styles based on step settings
  let tooltipStyle: React.CSSProperties = {};
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    // Dock at the bottom on mobile viewports to prevent screen clipping
    tooltipStyle = {
      position: 'fixed',
      bottom: '88px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)',
      maxWidth: '380px',
    };
  } else if (coords) {
    const gap = 12;
    if (activeStep.position === 'right') {
      tooltipStyle = {
        top: coords.top + coords.height / 2,
        left: coords.left + coords.width + gap,
        transform: 'translateY(-50%)',
      };
    } else if (activeStep.position === 'bottom') {
      tooltipStyle = {
        top: coords.top + coords.height + gap,
        left: coords.left + coords.width / 2,
        transform: 'translateX(-50%)',
      };
    } else if (activeStep.position === 'left') {
      tooltipStyle = {
        top: coords.top + coords.height / 2,
        left: coords.left - gap,
        transform: 'translate(-100%, -50%)',
      };
    } else if (activeStep.position === 'top') {
      tooltipStyle = {
        top: coords.top - gap,
        left: coords.left + coords.width / 2,
        transform: 'translate(-50%, -100%)',
      };
    }
  } else {
    tooltipStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  return (
    <>
      {/* Dark overlay backdrop with highlight cutout */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998] transition-all duration-300"
        style={{
          clipPath: coords 
            ? `polygon(
                0% 0%, 
                0% 100%, 
                ${coords.left - 6}px 100%, 
                ${coords.left - 6}px ${coords.top - 6}px, 
                ${coords.left + coords.width + 6}px ${coords.top - 6}px, 
                ${coords.left + coords.width + 6}px ${coords.top + coords.height + 6}px, 
                ${coords.left - 6}px ${coords.top + coords.height + 6}px, 
                ${coords.left - 6}px 100%, 
                100% 100%, 
                100% 0%
              )`
            : undefined
        }}
        onClick={handleSkip}
      />

      {/* Floating Tooltip Card */}
      <div 
        className="absolute z-[9999] w-[320px] max-w-[90vw] bg-white rounded-2xl border border-gray-150 shadow-2xl p-5 animate-scale-up"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-1.5 text-brand-600">
            <Award className="w-4 h-4" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Guide step {stepIndex + 1} of {steps.length}</span>
          </div>
          <button 
            onClick={handleSkip} 
            className="text-gray-405 hover:text-gray-600 p-0.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h4 className="text-sm font-extrabold text-gray-900 mb-1.5">{activeStep?.title}</h4>
        <p className="text-xs text-gray-500 leading-normal mb-4 font-medium">{activeStep?.description}</p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3.5">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-gray-405 hover:text-gray-600 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white active:scale-95 transition-all text-xs font-bold shadow-xs"
            >
              {stepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

OnboardingTour.start = () => {
  localStorage.removeItem('venuepro_onboarding_completed');
  window.dispatchEvent(new CustomEvent('start-onboarding-tour'));
};
