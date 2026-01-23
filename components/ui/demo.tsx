
import HolographicCard from "./holographic-card";

export default function DemoOne() {
  return (
    <HolographicCard className="w-80 h-96">
      <div className="holo-content text-center p-10 flex flex-col items-center justify-center h-full">
          <h3 className="component-title" style={{fontWeight: 700, fontSize: '1.25rem', color: '#1e3a8a', letterSpacing: '-0.025em'}}>
              Holographic Card
          </h3>
          <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
              Move your mouse over me!
          </p>
      </div>
    </HolographicCard>
  );
}
