import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function LevelUpModal({ isOpen, level, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      // Trigger confetti animation
      const canvas = canvasRef.current;
      const confettiInstance = confetti.create(canvas, { resize: true });
      
      confettiInstance({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#F59E0B', '#F97316', '#DC2626'],
      });

      // Second confetti burst
      setTimeout(() => {
        confettiInstance({
          particleCount: 150,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.5 },
          colors: ['#FBBF24', '#F59E0B'],
        });

        confettiInstance({
          particleCount: 150,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.5 },
          colors: ['#F97316', '#DC2626'],
        });
      }, 500);

      return () => confettiInstance.reset();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Canvas for confetti */}
          <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
          />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -50 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-8 text-center max-w-md w-full mx-4 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-900 hover:text-gray-950 transition"
              >
                <X size={24} />
              </button>

              {/* Content */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                className="text-6xl mb-6"
              >
                👑
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-950 mb-2">
                Level Up!
              </h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-black text-gray-950 mb-4"
              >
                Level {level}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-950 font-semibold mb-6"
              >
                🎉 Congratulations on reaching a new milestone! Continue solving problems to unlock more rewards.
              </motion.p>

              {/* Rewards Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/20 rounded-lg p-4 mb-6 space-y-2 text-gray-950 font-medium"
              >
                <div className="flex justify-between items-center">
                  <span>✨ XP Bonus</span>
                  <span>+500 XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🎖️ New Badge</span>
                  <span>Level {level} Master</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🎁 Reward</span>
                  <span>5 Boost Coins</span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 bg-gray-950 text-white font-semibold py-3 rounded-lg hover:bg-gray-900 transition"
                >
                  Continue
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-white text-yellow-400 font-semibold py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  Share
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
