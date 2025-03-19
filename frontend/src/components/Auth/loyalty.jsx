import React from 'react';

const LoyaltyCard = ({ tier }) => {
  const tiers = {
    bronze: {
      color: 'from-amber-700 to-amber-900',
      textColor: 'text-amber-100',
      benefits: ['Early booking', 'Welcome gifts on arrivals', 'Exclusive partner discounts']
    },
    silver: {
      color: 'from-gray-300 to-gray-500',
      textColor: 'text-gray-100',
      benefits: [
        'All Bronze benefits',
        'Room upgrades when possible',
        'Late checkout',
        'Priority customer service',
        'Relocation fee waivers'
      ]
    },
    gold: {
      color: 'from-yellow-400 to-yellow-600',
      textColor: 'text-yellow-100',
      benefits: [
        'All Silver benefits',
        'Concierge services',
        'Airport transportation',
        'Exclusive events (spa treatments, private chef)'
      ]
    }
  };

  const { color, textColor, benefits } = tiers[tier.toLowerCase()];

  return (
    <div className="max-w-md mx-auto p-1 bg-gradient-to-br from-stone-800 via-stone-900 to-black rounded-xl shadow-2xl">
      <div className={`h-full bg-gradient-to-br ${color} rounded-lg p-6 relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-16 -translate-x-16" />
        
        {/* Card content */}
        <div className="relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className={`text-3xl font-bold ${textColor} uppercase tracking-wider`}>
                {tier}
              </h3>
              <p className="text-white/60 mt-1">Stay Vista Rewards</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <span className={`text-2xl ${textColor}`}>SV</span>
            </div>
          </div>

          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-1.5 h-1.5 rounded-full ${textColor} mr-2`} />
                <p className="text-white/80 text-sm">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <p className={`text-sm ${textColor}`}>
              Exclusive member since 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoyaltyTiers = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-100">
      <h2 className="text-2xl font-bold text-center mb-12">Stay Vista Loyalty Program</h2>
      <div className="grid gap-8 md:grid-cols-3">
        <LoyaltyCard tier="Bronze" />
        <LoyaltyCard tier="Silver" />
        <LoyaltyCard tier="Gold" />
      </div>
    </div>
  );
};

export default LoyaltyTiers;