import { Trophy, Coins, Clock, Heart, Lock, Unlock, Star, Zap, Palette, Medal, Award, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useEffect, useState } from 'react';

export function GameUI() {
  const { 
    score, 
    timeRemaining, 
    position, 
    upgrades, 
    unlockUpgrade, 
    canUnlockUpgrade,
    isDemo,
    demoTrialEnded,
    racesCompleted,
    bonuses,
    bestPosition,
    bestTime,
    getBonuses
  } = useGameStore();
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showRaceComplete, setShowRaceComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'steering' | 'materials' | 'fasteners' | 'demo-special'>('steering');

  useEffect(() => {
    const timer = setInterval(() => {
      useGameStore.getState().updateTime(Math.max(0, timeRemaining - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  useEffect(() => {
    if (bonuses.length > 0) {
      setShowRaceComplete(true);
      const timer = setTimeout(() => setShowRaceComplete(false), 5000);
      return () => clearInterval(timer);
    }
  }, [bonuses]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categoryUpgrades = {
    steering: upgrades.filter(u => ['rope_steering', 'steering_wheel'].includes(u.id)),
    materials: upgrades.filter(u => ['wooden_body', 'metal_body', 'carbon_fiber'].includes(u.id)),
    fasteners: upgrades.filter(u => ['nails', 'bolts', 'premium_fasteners'].includes(u.id)),
    'demo-special': upgrades.filter(u => ['demo_boost', 'demo_paint'].includes(u.id))
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'steering': return '🎮';
      case 'materials': return '🏗️';
      case 'fasteners': return '🔧';
      case 'demo-special': return '⭐';
      default: return '📦';
    }
  };

  const getTotalBonusAmount = () => {
    return bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  };

  return (
    <>
      <div className="absolute top-0 left-0 w-full p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-xl">Position: {position}/10</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-500" />
              <span className="text-xl">Geordie Notes: {score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              <span className="text-xl">Time: {formatTime(timeRemaining)}</span>
            </div>
            {isDemo && (
              <div className="flex items-center gap-2">
                <Medal className="w-6 h-6 text-purple-400" />
                <span className="text-xl">Races: {racesCompleted}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isDemo && (
              <div className="text-yellow-400 font-bold px-3 py-1 bg-yellow-400/20 rounded-full">
                Demo Version
              </div>
            )}
            <div className="text-xl font-bold">Streets of Home - Newcastle</div>
            <button
              onClick={() => setShowUpgrades(!showUpgrades)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Upgrades
            </button>
          </div>
        </div>
      </div>

      {/* Race Completion Screen */}
      {showRaceComplete && bonuses.length > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-lg w-full">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <h2 className="text-3xl font-bold text-white">Race Complete!</h2>
              <p className="text-gray-300 mt-2">Well done, champion!</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-300">Position</p>
                <p className="text-2xl font-bold text-white">{position}/10</p>
                {position === bestPosition && (
                  <p className="text-sm text-yellow-400 mt-1">New Best!</p>
                )}
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-300">Time</p>
                <p className="text-2xl font-bold text-white">{formatTime(timeRemaining)}</p>
                {timeRemaining > bestTime && (
                  <p className="text-sm text-yellow-400 mt-1">New Record!</p>
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Race Bonuses</h3>
              <div className="space-y-3">
                {bonuses.map((bonus, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {bonus.type === 'position' && <Trophy className="w-5 h-5 text-yellow-400" />}
                      {bonus.type === 'time' && <Clock className="w-5 h-5 text-blue-400" />}
                      {bonus.type === 'style' && <Award className="w-5 h-5 text-purple-400" />}
                      <span className="text-gray-300">{bonus.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">+{bonus.amount}</span>
                      <Coins className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Total Bonus</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">+{getTotalBonusAmount()}</span>
                      <Coins className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRaceComplete(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Continue Racing
            </button>
          </div>
        </div>
      )}

      {/* Demo Trial Ended Message */}
      {demoTrialEnded && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Demo Trial Ended!</h2>
            <p className="text-gray-300 mb-6">
              Thank you for trying Streets of Home - Newcastle! Purchase the full game to:
            </p>
            <ul className="text-left text-gray-300 mb-6 space-y-2">
              <li>✨ Access premium upgrades</li>
              <li>✨ Unlock all tracks</li>
              <li>✨ Unlimited gameplay time</li>
              <li>✨ Advanced customization options</li>
            </ul>
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Your Demo Achievement</h3>
                <p className="text-gray-300">Races Completed: {racesCompleted}</p>
                <p className="text-gray-300">Best Position: {bestPosition}/10</p>
                <p className="text-gray-300">Geordie Notes Earned: {score}</p>
              </div>
              <button className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors">
                Get Full Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrades Panel */}
      {showUpgrades && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-sm text-white p-6 rounded-lg w-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Car Upgrades</h2>
            <button
              onClick={() => setShowUpgrades(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-4">
            {(['steering', 'materials', 'fasteners', 'demo-special'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg capitalize flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-blue-500'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <span>{getCategoryIcon(category)}</span>
                {category.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {categoryUpgrades[selectedCategory].map((upgrade) => {
              const canUnlock = canUnlockUpgrade(upgrade.id);
              return (
                <div
                  key={upgrade.id}
                  className={`p-4 rounded-lg ${
                    upgrade.unlocked
                      ? 'bg-green-900/50'
                      : canUnlock
                      ? 'bg-blue-900/50'
                      : 'bg-gray-900/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {upgrade.name}
                        {upgrade.unlocked ? (
                          <Unlock className="w-4 h-4 text-green-400" />
                        ) : upgrade.fullGameOnly ? (
                          <Star className="w-4 h-4 text-yellow-400" />
                        ) : upgrade.id === 'demo_boost' ? (
                          <Zap className="w-4 h-4 text-purple-400" />
                        ) : upgrade.id === 'demo_paint' ? (
                          <Palette className="w-4 h-4 text-pink-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-300">{upgrade.description}</p>
                      {upgrade.requires && !upgrade.unlocked && (
                        <p className="text-sm text-yellow-500 mt-1">
                          Requires: {upgrade.requires.join(', ')}
                        </p>
                      )}
                      {upgrade.fullGameOnly && (
                        <p className="text-sm text-yellow-400 mt-1">
                          Available in Full Game
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">{upgrade.cost}</span>
                      <Coins className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                  {!upgrade.unlocked && !upgrade.fullGameOnly && (
                    <button
                      onClick={() => canUnlock && unlockUpgrade(upgrade.id)}
                      disabled={!canUnlock || demoTrialEnded}
                      className={`mt-2 w-full py-2 rounded ${
                        canUnlock && !demoTrialEnded
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-gray-700 cursor-not-allowed'
                      }`}
                    >
                      {demoTrialEnded ? 'Demo Ended' : canUnlock ? 'Purchase' : 'Locked'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}