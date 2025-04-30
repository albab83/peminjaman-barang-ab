<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import '../../app.css';
</script>

<Navbar />

<main class="px-6 py-4">
  <slot />
</main>
