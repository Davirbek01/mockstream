// ================================================================================
// HOLIDAY SNOWFLAKES - Auto-disables after January 16
// ================================================================================

(function() {
  'use strict';
  
  // Configuration
  const HOLIDAY_END_DATE = new Date('2026-01-16T23:59:59'); // January 16, 2026
  const SNOWFLAKE_COUNT = 35; // Number of snowflakes
  
  // Check if we're still in the holiday period
  function isHolidayPeriod() {
    const now = new Date();
    return now <= HOLIDAY_END_DATE;
  }
  
  // Don't run if holiday period is over
  if (!isHolidayPeriod()) {
    return;
  }
  
  // Inject CSS styles
  const style = document.createElement('style');
  style.textContent = `
    /* Snowflake Container */
    .snowflakes-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }
    
    /* Individual Snowflake */
    .snowflake {
      position: absolute;
      top: -20px;
      color: #b3d9e8;
      font-size: 1em;
      text-shadow: 0 0 5px rgba(173, 216, 230, 0.5);
      animation: snowfall linear infinite;
      opacity: 0.7;
      user-select: none;
    }
    
    /* Dark mode snowflakes */
    [data-theme="dark"] .snowflake {
      color: #4a90a4;
      text-shadow: 0 0 8px rgba(74, 144, 164, 0.6);
      opacity: 0.5;
    }
    
    /* Snowfall Animation */
    @keyframes snowfall {
      0% {
        transform: translateY(-20px) rotate(0deg) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 0.7;
      }
      90% {
        opacity: 0.7;
      }
      100% {
        transform: translateY(100vh) rotate(360deg) translateX(30px);
        opacity: 0;
      }
    }
    
    /* Gentle sway animation */
    @keyframes sway {
      0%, 100% {
        transform: translateX(0);
      }
      50% {
        transform: translateX(20px);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Create snowflakes container
  const container = document.createElement('div');
  container.className = 'snowflakes-container';
  container.setAttribute('aria-hidden', 'true');
  
  // Snowflake characters
  const snowflakeChars = ['❄', '❅', '❆', '✻', '✼', '❉', '✺'];
  
  // Create snowflakes
  for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
    
    // Random properties
    const left = Math.random() * 100;
    const size = Math.random() * 0.8 + 0.5; // 0.5 to 1.3em
    const duration = Math.random() * 10 + 8; // 8 to 18 seconds
    const delay = Math.random() * 15; // 0 to 15 seconds delay
    const opacity = Math.random() * 0.4 + 0.3; // 0.3 to 0.7
    
    snowflake.style.cssText = `
      left: ${left}%;
      font-size: ${size}em;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${opacity};
    `;
    
    container.appendChild(snowflake);
  }
  
  // Add container to body when DOM is ready
  function addSnowflakes() {
    if (document.body) {
      document.body.appendChild(container);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(container);
      });
    }
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addSnowflakes);
  } else {
    addSnowflakes();
  }
  
  // Console message for debugging
  console.log('🎄 Holiday snowflakes active until January 16, 2026');
})();
