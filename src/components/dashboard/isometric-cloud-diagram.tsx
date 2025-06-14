import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface ProviderStatus {
  provider: string;
  status: string;
  resourceCount: number;
  lastSync: string;
}

export function IsometricCloudDiagram() {
  const [dataFlowOffset, setDataFlowOffset] = useState(0);
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  
  console.log('IsometricCloudDiagram rendering...');

  const { data: providerStatuses } = useQuery({
    queryKey: ['/api/multi-cloud/status'],
    refetchInterval: 5000
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDataFlowOffset(prev => (prev + 2) % 100);
      
      // Simulate active connections
      const connectedProviders = providerStatuses?.filter(
        (p: ProviderStatus) => p.status === 'connected'
      ).map((p: ProviderStatus) => p.provider) || [];
      
      setActiveConnections(prev => {
        if (connectedProviders.length === 0) return [];
        const randomIndex = Math.floor(Math.random() * connectedProviders.length);
        return [connectedProviders[randomIndex]];
      });
    }, 150);

    return () => clearInterval(interval);
  }, [providerStatuses]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#00ff88';
      case 'deploying': return '#ffaa00';
      case 'error': return '#ff4444';
      default: return '#666666';
    }
  };

  return (
    <div className="w-full h-[700px] bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-lg overflow-hidden relative">
      <svg 
        viewBox="0 0 1200 800" 
        className="w-full h-full"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7"/>
          </linearGradient>
          
          <linearGradient id="serverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8"/>
          </linearGradient>

          <linearGradient id="dataFlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0"/>
            <stop offset="50%" stopColor="#00ff88" stopOpacity="1"/>
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0"/>
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-100,0;200,0;-100,0"
              dur="2s"
              repeatCount="indefinite"
            />
          </linearGradient>

          {/* Filters */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="6" stdDeviation="3" floodOpacity="0.3"/>
          </filter>

          {/* Patterns */}
          <pattern id="circuitPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0,10 L20,10 M10,0 L10,20" stroke="#00ff88" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>

        {/* Background Elements */}
        <rect width="100%" height="100%" fill="url(#circuitPattern)" opacity="0.1"/>
        
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <circle
            key={i}
            cx={100 + i * 100}
            cy={150 + Math.sin(i) * 50}
            r="2"
            fill="#00ff88"
            opacity="0.6"
          >
            <animate
              attributeName="cy"
              values={`${150 + Math.sin(i) * 50};${130 + Math.sin(i) * 50};${150 + Math.sin(i) * 50}`}
              dur={`${2 + i * 0.3}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur={`${1.5 + i * 0.2}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Main Cloud Infrastructure */}
        <g transform="translate(600,200)">
          {/* Central Cloud Server */}
          <g transform="skewX(-15) skewY(5)">
            <rect 
              x="-80" 
              y="-40" 
              width="160" 
              height="80" 
              rx="8"
              fill="url(#cloudGradient)"
              stroke="#0ea5e9"
              strokeWidth="2"
              filter="url(#dropShadow)"
            />
            <rect 
              x="-60" 
              y="-20" 
              width="120" 
              height="40" 
              rx="4"
              fill="#1e293b"
              opacity="0.7"
            />
            
            {/* Server Lights */}
            {[...Array(8)].map((_, i) => (
              <circle
                key={i}
                cx={-50 + i * 15}
                cy={-10}
                r="3"
                fill={i < 6 ? "#00ff88" : "#ff4444"}
              >
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur={`${0.8 + i * 0.1}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
          
          <text y="80" className="text-white text-sm text-center" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
            AI Orchestrator
          </text>
          <text y="100" className="text-cyan-300 text-xs" textAnchor="middle" fill="#06b6d4" fontSize="12">
            Multi-Cloud Engine
          </text>
        </g>

        {/* Laptop/Client */}
        <g transform="translate(150,500)">
          <g transform="skewX(-15) skewY(5)">
            {/* Laptop Base */}
            <rect 
              x="0" 
              y="20" 
              width="120" 
              height="80" 
              rx="8"
              fill="url(#serverGradient)"
              stroke="#0284c7"
              strokeWidth="2"
              filter="url(#dropShadow)"
            />
            {/* Laptop Screen */}
            <rect 
              x="10" 
              y="-30" 
              width="100" 
              height="60" 
              rx="4"
              fill="#1e293b"
              stroke="#0284c7"
              strokeWidth="2"
            />
            {/* Screen Content */}
            <rect x="20" y="-20" width="80" height="40" rx="2" fill="#0f172a"/>
            <text x="60" y="0" textAnchor="middle" fill="#00ff88" fontSize="10">Dashboard</text>
          </g>
          <text y="130" textAnchor="middle" fill="white" fontSize="12" x="60">Developer</text>
        </g>

        {/* Database Cluster */}
        <g transform="translate(1000,450)">
          {[...Array(3)].map((_, i) => (
            <g key={i} transform={`translate(${i * 15}, ${-i * 10}) skewX(-15) skewY(5)`}>
              <ellipse 
                cx="30" 
                cy="20" 
                rx="25" 
                ry="15"
                fill="url(#serverGradient)"
                stroke="#0284c7"
                strokeWidth="2"
                filter="url(#dropShadow)"
              />
              <rect 
                x="5" 
                y="10" 
                width="50" 
                height="20" 
                fill="url(#serverGradient)"
                stroke="#0284c7"
                strokeWidth="2"
              />
              <ellipse 
                cx="30" 
                cy="30" 
                rx="25" 
                ry="15"
                fill="url(#serverGradient)"
                stroke="#0284c7"
                strokeWidth="2"
              />
            </g>
          ))}
          <text y="90" textAnchor="middle" fill="white" fontSize="12" x="30">Database</text>
        </g>

        {/* Cloud Provider Nodes */}
        {[
          { name: 'AWS', pos: [200, 300], icon: '🚀' },
          { name: 'Azure', pos: [400, 150], icon: '⚡' },
          { name: 'GCP', pos: [800, 120], icon: '🌟' },
          { name: 'Oracle', pos: [950, 280], icon: '🔷' },
          { name: 'IBM', pos: [350, 350], icon: '🔧' },
          { name: 'DO', pos: [750, 350], icon: '🌊' }
        ].map((provider, index) => {
          const isActive = activeConnections.includes(provider.name.toLowerCase());
          const providerStatus = providerStatuses?.find(
            (p: ProviderStatus) => p.provider.toLowerCase() === provider.name.toLowerCase()
          );
          const statusColor = getStatusColor(providerStatus?.status || 'unknown');
          
          return (
            <g key={provider.name} transform={`translate(${provider.pos[0]}, ${provider.pos[1]})`}>
              {/* Provider Node */}
              <g transform="skewX(-15) skewY(5)">
                <rect 
                  x="-25" 
                  y="-15" 
                  width="50" 
                  height="30" 
                  rx="6"
                  fill={isActive ? statusColor : '#1e293b'}
                  stroke={statusColor}
                  strokeWidth="2"
                  filter="url(#glow)"
                  opacity={isActive ? "0.9" : "0.7"}
                >
                  {isActive && (
                    <animate
                      attributeName="opacity"
                      values="0.7;1;0.7"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  )}
                </rect>
              </g>
              
              {/* Provider Label */}
              <text y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
                {provider.name}
              </text>
              
              {/* Resource Count */}
              {providerStatus?.resourceCount > 0 && (
                <text y="50" textAnchor="middle" fill="#06b6d4" fontSize="9">
                  {providerStatus.resourceCount} resources
                </text>
              )}

              {/* Status Indicator */}
              <circle 
                cx="20" 
                cy="-20" 
                r="4" 
                fill={statusColor}
                filter="url(#glow)"
              >
                {providerStatus?.status === 'connected' && (
                  <animate
                    attributeName="r"
                    values="4;6;4"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* Data Flow Connection */}
              {isActive && (
                <g>
                  <path
                    d={`M 0,0 Q ${300},${-100} ${400},${200 - provider.pos[1]}`}
                    stroke="url(#dataFlowGradient)"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.8"
                  />
                  
                  {/* Data Packets */}
                  {[...Array(3)].map((_, i) => (
                    <circle
                      key={i}
                      r="3"
                      fill="#00ff88"
                      opacity="0.8"
                    >
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        begin={`${i * 0.5}s`}
                      >
                        <mpath href={`#dataPath-${index}`}/>
                      </animateMotion>
                    </circle>
                  ))}
                  
                  <path
                    id={`dataPath-${index}`}
                    d={`M 0,0 Q ${300},${-100} ${400},${200 - provider.pos[1]}`}
                    opacity="0"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* API Gateway */}
        <g transform="translate(600,500)">
          <g transform="skewX(-15) skewY(5)">
            <rect 
              x="-40" 
              y="-20" 
              width="80" 
              height="40" 
              rx="8"
              fill="#374151"
              stroke="#10b981"
              strokeWidth="2"
              filter="url(#dropShadow)"
            />
          </g>
          <text y="45" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
            API Gateway
          </text>
        </g>

        {/* Connection Lines */}
        <g stroke="#00ff88" strokeWidth="2" opacity="0.6">
          {/* Client to API Gateway */}
          <path 
            d="M 270,540 L 560,540"
            strokeDasharray="5,5"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;10"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* API Gateway to Cloud */}
          <path 
            d="M 600,480 L 600,280"
            strokeDasharray="5,5"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;10"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Cloud to Database */}
          <path 
            d="M 680,240 L 960,440"
            strokeDasharray="5,5"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;10"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Status Dashboard */}
        <g transform="translate(50,100)">
          <rect 
            width="200" 
            height="120" 
            rx="8"
            fill="#1e293b"
            stroke="#06b6d4"
            strokeWidth="1"
            opacity="0.9"
          />
          <text x="100" y="25" textAnchor="middle" fill="#06b6d4" fontSize="14" fontWeight="bold">
            System Status
          </text>
          
          {['Connected Providers', 'Active Deployments', 'Total Resources'].map((metric, i) => {
            const values = [
              providerStatuses?.filter((p: ProviderStatus) => p.status === 'connected').length || 0,
              providerStatuses?.filter((p: ProviderStatus) => p.status === 'deploying').length || 0,
              providerStatuses?.reduce((sum: number, p: ProviderStatus) => sum + p.resourceCount, 0) || 0
            ];
            
            return (
              <g key={metric} transform={`translate(20, ${50 + i * 25})`}>
                <text y="0" fill="white" fontSize="11">{metric}:</text>
                <text x="140" y="0" fill="#00ff88" fontSize="11" fontWeight="bold">
                  {values[i]}
                </text>
              </g>
            );
          })}
        </g>

        {/* Title */}
        <text x="600" y="50" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
          Multi-Cloud Infrastructure
        </text>
      </svg>
    </div>
  );
}