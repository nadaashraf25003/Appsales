// Advanced Unauthorized Component with Particles
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const particleCount = 50;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(239, 68, 68, ${Math.random() * 0.3 + 0.1})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animateParticles);
    };

    initParticles();
    animateParticles();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
      {/* Animated Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-gray-900/30"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Lock Icon */}
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 flex items-center justify-center backdrop-blur-sm">
              <svg 
                className="w-24 h-24 text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m12-2.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5.5M12 12l4-4m0 0l4 4m-4-4v8" 
                />
              </svg>
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-400">
            403 Forbidden
          </h1>
          
          <p className="text-2xl text-gray-300 mb-6">
            🛡️ Restricted Access Zone
          </p>
          
          <div className="max-w-md mx-auto mb-10">
            <p className="text-gray-400 text-lg leading-relaxed">
              This area is protected and requires special authorization. 
              Your current credentials don't grant access to this resource.
            </p>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700 mb-10">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="font-mono text-gray-300">
              UNAUTHORIZED • ERROR 403
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="group px-8 py-4 bg-gray-800/50 hover:bg-gray-700/70 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Return to Previous</span>
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="group px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Back to Home</span>
            </button>
          </div>

          {/* Support Link */}
          <div className="mt-12 pt-8 border-t border-gray-800/50">
            <p className="text-gray-500 mb-2">Need assistance?</p>
            <a 
              href="mailto:support@example.com" 
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Security Administrator
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm text-gray-600">
            Access logs are monitored for security purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;