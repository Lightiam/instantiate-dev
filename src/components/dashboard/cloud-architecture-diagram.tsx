import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface ProviderStatus {
  provider: string;
  status: string;
  resourceCount: number;
  lastSync: string;
}

export function CloudArchitectureDiagram() {
  const [animationOffset, setAnimationOffset] = useState(0);

  const { data: providerStatuses } = useQuery({
    queryKey: ['/api/multi-cloud/status'],
    refetchInterval: 10000
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#06b6d4';
      case 'deploying': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getProviderPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 200;
    const centerX = 500;
    const centerY = 350;
    
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  const providers = [
    { name: 'AWS', label: 'AWS' },
    { name: 'Azure', label: 'AZ' },
    { name: 'GCP', label: 'GCP' },
    { name: 'IBM', label: 'IBM' },
    { name: 'Oracle', label: 'ORCL' },
    { name: 'DigitalOcean', label: 'DO' },
    { name: 'Linode', label: 'LND' },
    { name: 'Alibaba', label: '阿里' },
    { name: 'Huawei', label: 'HW' },
    { name: 'Tencent', label: '腾讯' },

  ];

  return (
    <div className="w-full h-[600px] bg-[#0d1117] rounded-lg overflow-hidden relative">
      <svg 
        viewBox="0 0 1000 700" 
        className="w-full h-full"
        style={{ background: '#0d1117' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0"/>
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="1"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-100,0;100,0;-100,0"
              dur="3s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>

        <style>
          {`
            .text { fill: white; font-family: 'Courier New', monospace; }
            .label { font-size: 12px; text-anchor: middle; }
            .title { font-size: 24px; fill: #06b6d4; font-weight: bold; }
            .connector { stroke: #6366f1; stroke-width: 1.5; stroke-dasharray: 5,3; }
            .pulse { stroke: url(#pulseGradient); stroke-width: 2; }
          `}
        </style>

        {/* Title */}
        <text x="500" y="50" className="text title" textAnchor="middle">
          &lt;/&gt; Instanti8.dev - Multi-Cloud Architecture
        </text>

        {/* Central AI Core */}
        <g transform="translate(500,350)">
          <circle 
            r="60" 
            stroke="#06b6d4" 
            strokeWidth="2" 
            fill="#1a1a1a"
            filter="url(#glow)"
          />
          <circle 
            r="50" 
            stroke="#06b6d4" 
            strokeWidth="1" 
            fill="none"
            opacity="0.5"
          >
            <animate 
              attributeName="r" 
              values="50;70;50" 
              dur="2s" 
              repeatCount="indefinite"
            />
            <animate 
              attributeName="opacity" 
              values="0.5;0.1;0.5" 
              dur="2s" 
              repeatCount="indefinite"
            />
          </circle>
          <text y="5" className="text label">AI Orchestrator</text>
          <text y="20" className="text label" fontSize="10">
            {providerStatuses??.filter?.((p: ProviderStatus) => p.status === 'connected').length || 0}/11 Active
          </text>
        </g>

        {/* Cloud Providers in Circle */}
        {providers.map((provider, index) => {
          const position = getProviderPosition(index, providers.length);
          const providerStatus = providerStatuses??.find?.(
            (p: ProviderStatus) => p.provider.toLowerCase() === provider.name.toLowerCase()
          );
          const statusColor = getStatusColor(providerStatus?.status || 'unknown');
          
          return (
            <g key={provider.name} transform={`translate(${position.x - 30}, ${position.y - 20})`}>
              {/* Provider Node */}
              <rect 
                x="10" 
                y="5" 
                width="40" 
                height="30" 
                rx="5"
                stroke={statusColor}
                strokeWidth="2"
                fill="#1e1e1e"
                filter="url(#glow)"
              />
              <text x="30" y="25" className="text label" fontSize="10">
                {provider.label}
              </text>
              <text x="30" y="-5" className="text label" fontSize="8">
                {provider.name}
              </text>
              
              {/* Status Indicator */}
              <circle 
                cx="50" 
                cy="5" 
                r="3" 
                fill={statusColor}
              >
                {providerStatus?.status === 'connected' && (
                  <animate 
                    attributeName="opacity" 
                    values="1;0.3;1" 
                    dur="1s" 
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* Resource Count */}
              {providerStatus?.resourceCount > 0 && (
                <text x="30" y="45" className="text label" fontSize="8" fill="#06b6d4">
                  {providerStatus.resourceCount} resources
                </text>
              )}

              {/* Connection Line to Center */}
              <line 
                x1="30" 
                y1="20" 
                x2={500 - position.x + 30} 
                y2={350 - position.y + 20}
                stroke={statusColor}
                strokeWidth="1.5"
                strokeDasharray="5,3"
                opacity="0.7"
              >
                {providerStatus?.status === 'connected' && (
                  <animate 
                    attributeName="stroke-dashoffset" 
                    values="0;8" 
                    dur="1s" 
                    repeatCount="indefinite"
                  />
                )}
              </line>
            </g>
          );
        })}

        {/* Code Deployment Block */}
        <g transform="translate(400,520)">
          <rect 
            width="200" 
            height="100" 
            rx="8" 
            fill="#1e1e1e" 
            stroke="#06b6d4"
            strokeWidth="1"
          />
          <text x="100" y="20" className="text label">deployment.yaml</text>
          <text x="10" y="40" className="text" fontSize="10">apiVersion: v1</text>
          <text x="10" y="55" className="text" fontSize="10">kind: Deployment</text>
          <text x="10" y="70" className="text" fontSize="10">metadata:</text>
          <text x="20" y="85" className="text" fontSize="10">name: multi-cloud-app</text>
          
          {/* Connection to AI Core */}
          <line 
            x1="100" 
            y1="0" 
            x2="100" 
            y2="-110"
            className="pulse"
          />
        </g>

        {/* Git Repository */}
        <g transform="translate(125,575)">
          <circle r="25" fill="#1e1e1e" stroke="#6366f1" strokeWidth="2"/>
          <text y="5" className="text label">Git</text>
          <text y="-35" className="text label" fontSize="10">Source Control</text>
          
          {/* Connection to Code Block */}
          <line 
            x1="25" 
            y1="0" 
            x2="275" 
            y2="-55"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />
        </g>

        {/* CI/CD Pipeline */}
        <g transform="translate(825,575)">
          <circle r="25" fill="#1e1e1e" stroke="#6366f1" strokeWidth="2"/>
          <text y="5" className="text label">CI/CD</text>
          <text y="-35" className="text label" fontSize="10">Automation</text>
          
          {/* Connection to Code Block */}
          <line 
            x1="-25" 
            y1="0" 
            x2="-225" 
            y2="-55"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="3,2"
          />
        </g>

        {/* Real-time Activity Indicators */}
        {providerStatuses??.some?.((p: ProviderStatus) => p.status === 'deploying') && (
          <g>
            <circle cx="500" cy="350" r="80" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.5">
              <animate attributeName="r" values="80;120;80" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite"/>
            </circle>
            <text x="500" y="280" className="text label" fill="#f59e0b">
              Deployment in Progress...
            </text>
          </g>
        )}

        {/* Performance Metrics */}
        <g transform="translate(50,100)">
          <rect width="150" height="80" rx="5" fill="#1e1e1e" stroke="#06b6d4" strokeWidth="1"/>
          <text x="75" y="20" className="text label" fontSize="10">System Status</text>
          <text x="10" y="40" className="text" fontSize="9">
            Active Providers: {providerStatuses??.filter?.((p: ProviderStatus) => p.status === 'connected').length || 0}/11
          </text>
          <text x="10" y="55" className="text" fontSize="9">
            Total Resources: {providerStatuses??.reduce?.((sum: number, p: ProviderStatus) => sum + p.resourceCount, 0) || 0}
          </text>
          <text x="10" y="70" className="text" fontSize="9">
            Health: {((providerStatuses??.filter?.((p: ProviderStatus) => p.status === 'connected').length || 0) / 11 * 100).toFixed(0)}%
          </text>
        </g>
      </svg>
    </div>
  );
}
