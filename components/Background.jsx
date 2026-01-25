export default function Background() {
  return (
    <div 
      className="fixed inset-0 -z-10"
      style={{
        background: 'linear-gradient(to bottom, #1a1a1a 0%, #242424 35%, #3a231a 50%, #5a3425 62%, #845039 72%, #b06b4a 80%, #d89164 88%, #eab58a 94%, #f5d0a8 100%)'
      }}
    />
  );
}
