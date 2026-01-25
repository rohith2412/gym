export default function Background() {
  return (
    <div 
      className="fixed inset-0 -z-10"
      style={{
        background: 'linear-gradient(to bottom, #0b0b0b 0%, #141414 35%, #2a1812 50%, #4a2a1d 62%, #7a4630 72%, #a86645 80%, #cf8a60 88%, #e2a97f 94%, #f0c3a0 100%)'
      }}
    />
  );
}
