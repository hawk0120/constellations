<script>
  import { onMount, onDestroy } from 'svelte';
  import { startPolling, subscribe, stopPolling } from "./bluesky-ingest.js";

  let canvas;
  let ctx;
  let users = new Map(); // did -> {x, y, vx, vy, lastSeen, angle, radius, arm, twinkle}
  
  let animationId;
  let width, height;
  let galaxyRotation = 0;
  let time = 0;

  onMount(() => {
    const canvasElement = document.querySelector('#constellation-canvas');
    if (canvasElement instanceof HTMLCanvasElement) {
      canvas = canvasElement;
      ctx = canvas.getContext('2d');
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    startPolling(5000);
    const unsubscribe = subscribe(evt => handleInteraction(evt.actor));
    
    animate();
    
    return () => {
      unsubscribe();
      stopPolling();
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  });

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function handleInteraction(actorDid) {
    let user = users.get(actorDid);
    
    if (!user) {
      // Create new user in galaxy formation
      const arm = Math.floor(Math.random() * 3); // 3 spiral arms
      const armAngle = (arm * 2 * Math.PI / 3) + galaxyRotation;
      const radius = 100 + Math.random() * Math.min(width, height) * 0.35;
      const angle = armAngle + (radius / 500); // Spiral curve
      
      user = {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        lastSeen: Date.now(),
        size: 1 + Math.random() * 4,
        angle: angle,
        radius: radius,
        arm: arm,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.05 + Math.random() * 0.1
      };
      users.set(actorDid, user);
    } else {
      user.lastSeen = Date.now();
      // Boost twinkle on interaction
      user.twinkleSpeed = Math.min(0.2, user.twinkleSpeed + 0.02);
    }

    
  }

  function animate() {
    if (!ctx) return;
    
    time += 0.01;
    galaxyRotation += 0.002; // Slow galaxy rotation
    
    // Clear with trail effect
    ctx.fillStyle = 'rgba(0, 0, 3, 0.08)';
    ctx.fillRect(0, 0, width, height);

    const now = Date.now();
    
    // Update user positions with orbital mechanics
    users.forEach((user, did) => {
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Orbital motion around galaxy center
      user.angle += 0.002 / (user.radius / 200); // Faster rotation closer to center
      
      // Spiral arm motion
      const armAngle = (user.arm * 2 * Math.PI / 3) + galaxyRotation;
      const targetAngle = armAngle + (user.radius / 400);
      user.angle += (targetAngle - user.angle) * 0.02;
      
      // Strong gravitational pull toward invisible center
      const targetRadius = user.radius * 0.98; // Continuously pull inward
      user.radius += (targetRadius - user.radius) * 0.02; // Steady pull toward center
      
      // Update position based on polar coordinates
      user.x = centerX + Math.cos(user.angle) * user.radius;
      user.y = centerY + Math.sin(user.angle) * user.radius;
      
      // Gentle radius oscillation for breathing effect
      user.radius += Math.sin(time * 2 + user.twinkle) * 0.1;
      
      // Update twinkle
      user.twinkle += user.twinkleSpeed;
    });

    // Remove old users or those that reached the center
    users.forEach((user, did) => {
      if (now - user.lastSeen > 60000 || user.radius < 10) { // Remove after 1 minute or when too close to center
        users.delete(did);
      }
    });

    

    

    // Draw users as stars with enhanced effects
    users.forEach(user => {
      const age = now - user.lastSeen;
      const brightness = Math.max(0.2, 1 - age / 30000);
      const twinkle = (Math.sin(user.twinkle) + 1) / 2; // 0 to 1
      
      // Outer glow
      const glowSize = user.size * 4 * (1 + twinkle * 0.3);
      const gradient = ctx.createRadialGradient(user.x, user.y, 0, user.x, user.y, glowSize);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.8})`);
      gradient.addColorStop(0.2, `rgba(180, 200, 255, ${brightness * 0.4})`);
      gradient.addColorStop(0.5, `rgba(100, 150, 255, ${brightness * 0.2})`);
      gradient.addColorStop(1, 'rgba(50, 100, 200, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(user.x, user.y, glowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Star core with twinkle
      const coreSize = user.size * (0.8 + twinkle * 0.4);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * (0.9 + twinkle * 0.1)})`;
      ctx.beginPath();
      ctx.arc(user.x, user.y, coreSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Star spikes for larger stars
      if (user.size > 2.5) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.3 * twinkle})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(user.x - coreSize * 2, user.y);
        ctx.lineTo(user.x + coreSize * 2, user.y);
        ctx.moveTo(user.x, user.y - coreSize * 2);
        ctx.lineTo(user.x, user.y + coreSize * 2);
        ctx.stroke();
      }
    });

    animationId = requestAnimationFrame(animate);
  }
</script>

<canvas id="constellation-canvas" class="constellation-canvas"></canvas>

<style>
  .constellation-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center, #0a0520 0%, #000005 40%, #000000 100%);
  }
</style>