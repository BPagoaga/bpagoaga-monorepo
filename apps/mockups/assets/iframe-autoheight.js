// Resizes a [data-mockup-iframe-autoheight] iframe to its embedded page's real content
// height once it loads. Used for fixed-width previews (previews/): the iframe's own width
// forces a real breakpoint, but its height can't be known upfront.
document.querySelectorAll('[data-mockup-iframe-autoheight]').forEach((iframe) => {
  const fit = () => {
    try {
      iframe.style.height = `${iframe.contentDocument.documentElement.scrollHeight}px`;
    } catch {
      // Cross-origin or otherwise inaccessible: keep the fallback height set in markup.
    }
  };
  iframe.addEventListener('load', fit);
  if (iframe.contentDocument?.readyState === 'complete') fit();
});
