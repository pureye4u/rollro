<script lang="ts">
  import NavBarContainer from "../components/NavBarContainer.svelte";
  import { goto } from "$app/navigation";
</script>

<NavBarContainer>
  <div class="content-container">
    <section class="hero-section">
      <h1 class="hero-title">
        <span class="text-gradient">Welcome to</span> <br />
        <span class="text-gradient-primary">rollro</span>
      </h1>
      <p class="hero-subtitle">
        Your premium journey log. <br />
        Record, share, and relive your moments.
      </p>

      <div class="action-buttons">
        <button class="btn-primary" on:click={() => goto("/logs")}>
          Get Started
        </button>
      </div>
    </section>

    <section class="features-section">
      <div class="glass-panel feature-card">
        <h3>Route</h3>
        <p>Plan your path with precision.</p>
      </div>
      <div class="glass-panel feature-card">
        <h3>Logs</h3>
        <p>Keep track of every step.</p>
      </div>
    </section>
  </div>
</NavBarContainer>

<style>
  .content-container {
    padding: 80px 24px 40px; /* Standard padding */
    max-width: 960px; /* Wider container for clean look */
    margin: 0 auto;
    text-align: center;
  }

  .hero-section {
    margin-bottom: 80px;
    animation: fadeIn 0.8s ease-out;
    padding-top: 60px;
  }

  .hero-title {
    font-size: 4rem; /* Larger, cleaner font */
    line-height: 1.1;
    margin-bottom: 24px;
    color: var(--color-text-heading);
    letter-spacing: -0.03em;
  }

  .hero-subtitle {
    font-size: 1.5rem;
    color: var(--color-text-body);
    margin-bottom: 48px;
    line-height: 1.6;
    font-weight: 400;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: white;
    border: none;
    padding: 14px 32px;
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: 4px; /* Slightly rounded, Google style */
    cursor: pointer;
    box-shadow:
      0 1px 2px 0 rgba(60, 64, 67, 0.3),
      0 1px 3px 1px rgba(60, 64, 67, 0.15);
    transition:
      background-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .btn-primary:hover {
    background-color: var(--color-primary-hover);
    box-shadow:
      0 1px 3px 0 rgba(60, 64, 67, 0.3),
      0 4px 8px 3px rgba(60, 64, 67, 0.15);
  }

  .features-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .feature-card {
    padding: 40px;
    border-radius: 8px;
    text-align: left;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    background: white;
    border: 1px solid #dadce0; /* Subtle border */
    box-shadow: none; /* Flat by default */
  }

  .feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(60, 64, 67, 0.1); /* Lift on hover */
    border-color: transparent;
  }

  .feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 16px;
    color: var(--color-text-heading);
  }

  .feature-card p {
    color: var(--color-text-body);
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.5;
  }

  /* Remove gradient text classes as we are going for clean solid colors */
  .text-gradient,
  .text-gradient-primary {
    background: none;
    -webkit-text-fill-color: initial;
    color: inherit;
  }

  .text-gradient-primary {
    color: var(--color-primary);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 600px) {
    .hero-title {
      font-size: 2.5rem;
    }
    .features-section {
      grid-template-columns: 1fr;
    }
  }
</style>
