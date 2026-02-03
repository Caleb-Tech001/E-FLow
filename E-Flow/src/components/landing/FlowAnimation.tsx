import { useEffect, useState } from "react";
import { Mail, Users, Target, Zap, ArrowRight } from "lucide-react";

// Particle type for floating elements
interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function FlowAnimation() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles for the animation
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 4 + Math.random() * 8,
    }));
    setParticles(newParticles);
  }, []);

  const stages = [
    { icon: Mail, label: "Emails", color: "from-blue-500 to-cyan-400" },
    { icon: Users, label: "Enrich", color: "from-violet-500 to-purple-400" },
    { icon: Target, label: "Segment", color: "from-orange-500 to-amber-400" },
    { icon: Zap, label: "Action", color: "from-emerald-500 to-green-400" },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-12 overflow-hidden rounded-3xl">
      {/* Background */}
      <div className="absolute inset-0 bg-card" />
      
      {/* Main content */}
      <div className="relative z-10 py-8 px-4 md:px-8 overflow-hidden">
        {/* Title */}
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-primary animate-pulse">
            ✨ Watch Your Data Transform
          </p>
        </div>

        {/* Flow visualization */}
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          {stages.map((stage, index) => (
            <div key={stage.label} className="flex items-center">
              {/* Stage circle */}
              <div className="relative group">
                {/* Rotating ring */}
                <div 
                  className="absolute -inset-1 rounded-full border-2 border-dashed border-primary/20"
                  style={{
                    animation: `spin 8s linear infinite`,
                    animationDelay: `${index * 0.2}s`,
                  }}
                />

                {/* Main circle */}
                <div 
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110`}
                  style={{
                    animation: `bounce 2s ease-in-out infinite`,
                    animationDelay: `${index * 0.3}s`,
                  }}
                >
                  <stage.icon className="w-7 h-7 md:w-9 md:h-9 text-white drop-shadow-lg" />
                </div>

                {/* Label */}
                <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs md:text-sm font-semibold whitespace-nowrap text-foreground">
                  {stage.label}
                </p>

                {/* Floating particles around each stage */}
                <div 
                  className="absolute w-2 h-2 rounded-full bg-white/60"
                  style={{
                    animation: `orbit 3s linear infinite`,
                    animationDelay: `${index * 0.5}s`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>

              {/* Arrow connector */}
              {index < stages.length - 1 && (
                <div className="flex items-center mx-1 md:mx-3">
                  {/* Animated data flow dots */}
                  <div className="relative w-8 md:w-16 h-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div 
                      className="absolute h-full w-4 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                      style={{
                        animation: `flowRight 1.5s ease-in-out infinite`,
                        animationDelay: `${index * 0.4}s`,
                      }}
                    />
                  </div>
                  <ArrowRight 
                    className="w-4 h-4 md:w-5 md:h-5 text-primary"
                    style={{
                      animation: `pulse 1.5s ease-in-out infinite`,
                      animationDelay: `${index * 0.4}s`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm md:text-base">
            <span className="inline-block animate-pulse">From raw emails</span>
            <span className="mx-2 text-primary">→</span>
            <span className="inline-block animate-pulse" style={{ animationDelay: '0.5s' }}>to actionable GTM playbooks</span>
            <span className="mx-2 text-primary">→</span>
            <span className="inline-block animate-pulse font-semibold text-primary" style={{ animationDelay: '1s' }}>in seconds</span>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes floatUp {
          0%, 100% {
            transform: translateY(100%) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(90%) scale(1);
          }
          90% {
            opacity: 1;
            transform: translateY(10%) scale(1);
          }
          100% {
            transform: translateY(0%) scale(0);
            opacity: 0;
          }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(35px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(35px) rotate(-360deg);
          }
        }

        @keyframes flowRight {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(300%);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
