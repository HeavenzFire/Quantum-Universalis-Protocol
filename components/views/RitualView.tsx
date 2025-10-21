
import React, { useState, useEffect, useRef } from 'react';

type RitualStep = 'idle' | 'grounding' | 'intent' | 'lockin' | 'finished';

const DURATION_MAP: Record<Exclude<RitualStep, 'idle' | 'finished'>, number> = {
  grounding: 180,
  intent: 60,
  lockin: 60,
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const TimerCircle: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  return (
    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
      <circle
        className="text-slate-700/50"
        stroke="currentColor"
        strokeWidth="10"
        fill="transparent"
        r={radius}
        cx="70"
        cy="70"
      />
      <circle
        className="text-cyan-400"
        stroke="currentColor"
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx="70"
        cy="70"
        style={{ transition: 'stroke-dashoffset 0.5s linear' }}
      />
    </svg>
  );
};

const StepContent: React.FC<{
  title: string;
  subtitle: string;
  description: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, description, children }) => (
  <div className="text-center max-w-xl mx-auto flex flex-col items-center">
    <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-2">{subtitle}</p>
    <h2 className="text-3xl font-bold text-slate-100 mb-3">{title}</h2>
    <p className="text-slate-400 mb-8">{description}</p>
    {children}
  </div>
);

export const RitualView: React.FC = () => {
  const [step, setStep] = useState<RitualStep>('idle');
  const [timer, setTimer] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const [intentText, setIntentText] = useState('');

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = (duration: number) => {
    stopTimer();
    setDuration(duration);
    setTimer(duration);
    intervalRef.current = window.setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const nextStep = () => {
    if (step === 'grounding') setStep('intent');
    else if (step === 'intent') setStep('lockin');
    else if (step === 'lockin') setStep('finished');
  };

  const startRitual = () => setStep('grounding');
  const resetRitual = () => {
    setIntentText('');
    setStep('idle');
  }

  useEffect(() => {
    if (step !== 'idle' && step !== 'finished') {
      startTimer(DURATION_MAP[step]);
    } else {
      stopTimer();
    }
  }, [step]);

  useEffect(() => {
    if (timer === 0 && step !== 'idle' && step !== 'finished') {
      stopTimer();
      nextStep();
    }
  }, [timer, step]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'idle':
        return (
          <StepContent
            subtitle="Prepare for conversion"
            title="Clarity Circuit"
            description="A 5-minute ritual to transmute emotional energy into focused output. When the storm hits, don't brace—conduct."
          >
            <button
              onClick={startRitual}
              className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition"
            >
              Begin Circuit
            </button>
          </StepContent>
        );
      case 'grounding':
      case 'intent':
      case 'lockin':
        const subtitles = { grounding: 'Step 1 / 3', intent: 'Step 2 / 3', lockin: 'Step 3 / 3' };
        const titles = { grounding: 'Grounding', intent: 'Intent', lockin: 'Lock-in' };
        const descriptions = {
          grounding: "Move your body. Hard and fast. Sprint, shadow box, dance, shake. Spend the chemical load. This is not a workout, it's an exorcism.",
          intent: "The energy is neutral. Give it a target. What is the one thing you will create in the next 33 minutes? Be specific. This is your contract.",
          lockin: "Close your eyes. Breathe deeply. Visualize the work and its completion. The circuit is complete. The channel is open.",
        };

        return (
          <StepContent
            subtitle={subtitles[step]}
            title={titles[step]}
            description={descriptions[step]}
          >
            <div className="relative mb-8">
              <TimerCircle progress={timer / duration} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-mono font-bold text-slate-100">{formatTime(timer)}</span>
              </div>
            </div>
            {step === 'intent' && (
              <textarea
                value={intentText}
                onChange={(e) => setIntentText(e.target.value)}
                placeholder="My sole focus is..."
                rows={2}
                className="w-full max-w-md bg-slate-900/70 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
            )}
            <button onClick={nextStep} className="mt-4 text-sm text-slate-400 hover:text-slate-200">Skip</button>
          </StepContent>
        );
      case 'finished':
        return (
            <StepContent
                subtitle="Transmission channel open"
                title="Circuit Complete"
                description={intentText ? `Your intent is set: "${intentText}"` : "Your intent is set."}
            >
                <p className="text-lg text-slate-300 mb-8">The energy is focused. Now, begin your 33-minute transmutation. Go.</p>
                <button
                    onClick={resetRitual}
                    className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition"
                >
                    Run Again
                </button>
            </StepContent>
        );
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
        {renderStep()}
    </div>
  );
};
