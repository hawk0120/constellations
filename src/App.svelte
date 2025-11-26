<script>
  import Constellation from './Constellation.svelte';
</script>

<main>
  <Constellation />
  <div class="info">
    <h1>Living Constellation</h1>
    <p>Watch as Bluesky users form connections in real-time</p>
  </div>
</main>

<style>
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  
  .info {
    position: absolute;
    top: 20px;
    left: 20px;
    color: rgba(255, 255, 255, 0.8);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    z-index: 10;
  }
  
  .info h1 {
    margin: 0 0 10px 0;
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: 2px;
  }
  
  .info p {
    margin: 0;
    font-size: 1rem;
    opacity: 0.7;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    background: #000;
  }
</style>