export default function Background() {
  return (
    <div 
      className="fixed inset-0 -z-10"
      style={{
        background: 'linear-gradient(to bottom, #0a0a0a 0%, #0f0f0f 40%, #1a0f0a 70%, #2a1510 85%, #3d2318 100%)'
      }}
    >
      {/* Main orange glow - bottom center */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[45%] opacity-25"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 140, 60, 0.4) 0%, rgba(255, 100, 40, 0.2) 30%, transparent 70%)',
          filter: 'blur(80px)'
        }}
      />
      
      {/* Secondary glow - top right */}
      <div 
        className="absolute top-[15%] right-[10%] w-[50%] h-[30%] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(180, 80, 40, 0.3) 0%, transparent 60%)',
          filter: 'blur(70px)'
        }}
      />
      
      {/* Accent glow - left side */}
      <div 
        className="absolute top-[40%] left-[5%] w-[40%] h-[25%] opacity-12"
        style={{
          background: 'radial-gradient(circle, rgba(255, 120, 50, 0.25) 0%, transparent 65%)',
          filter: 'blur(60px)'
        }}
      />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)'
        }}
      />
    </div>
  );
}