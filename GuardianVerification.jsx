import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmailStep from '../components/verify/EmailStep';
import PhoneStep from '../components/verify/PhoneStep';
import SellerBadgeStep from '../components/verify/SellerBadgeStep';
import VerifySuccess from '../components/verify/VerifySuccess';

const STEPS = ['email', 'phone', 'badge', 'success'];

const PROGRESS_STEPS = [
  { key: 'email', label: 'Email',  level: 1, required: true },
  { key: 'phone', label: 'Phone',  level: 2, required: true },
  { key: 'badge', label: 'Badge',  level: 3, required: false },
];

const variants = {
  enter:  (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
};

export default function GuardianVerification() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const currentStep = STEPS[stepIndex];

  const next = () => { setDir(1);  setStepIndex(i => Math.min(i + 1, STEPS.length - 1)); };
  const back = () => { setDir(-1); setStepIndex(i => Math.max(i - 1, 0)); };

  const progressIndex = PROGRESS_STEPS.findIndex(s => s.key === currentStep);
  const showProgress = !['success'].includes(currentStep);

  const stepMap = {
    email:   <EmailStep   onNext={next} />,
    phone:   <PhoneStep   onNext={next} onBack={back} />,
    badge:   <SellerBadgeStep onNext={next} onBack={back} />,
    success: <VerifySuccess />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7] font-inter">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4 shrink-0">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #4CAF1A 0%, #1A5008 100%)' }}>
            <span className="text-white font-black text-xs">FZ</span>
          </div>
          <div>
            <div className="text-sm font-black text-gray-900 leading-none">FlipZone™ Verification</div>
            <div className="text-[10px] text-gray-400 font-bold mt-0.5 tracking-widest uppercase">The Hustle Zone.</div>
          </div>
        </div>

        {/* Progress stepper */}
        {showProgress && (
          <div className="flex items-center">
            {PROGRESS_STEPS.map((s, i) => {
              const done   = i < progressIndex;
              const active = i === progressIndex;
              return (
                <React.Fragment key={s.key}>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all duration-300 ${
                      done   ? 'bg-hz-green border-hz-green text-white' :
                      active ? 'bg-white border-hz-green text-hz-green shadow-sm' :
                               'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-[8px] font-bold leading-none whitespace-nowrap ${
                        done || active ? 'text-hz-green-deep' : 'text-gray-300'
                      }`}>{s.label}</span>
                      {!s.required && (
                        <span className="text-[7px] text-gray-300 font-semibold leading-none">optional</span>
                      )}
                    </div>
                  </div>
                  {i < PROGRESS_STEPS.length - 1 && (
                    <div className={`flex-1 h-[2px] mb-4 mx-0.5 rounded-full transition-all duration-500 ${done ? 'bg-hz-green' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={currentStep}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0 overflow-y-auto"
          >
            {stepMap[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}