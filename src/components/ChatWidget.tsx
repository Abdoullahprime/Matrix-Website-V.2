import { useEffect } from 'react';

// Tidio live chat. This is the public widget address for the Matrix Solutions Tidio account
// (it identifies the account, it is not a secret). The chat itself is managed in the Tidio panel.
const TIDIO_SRC = 'https://code.tidio.co/kyqihueauxiiigr1vd9nge89ucxsdcyx.js';

// Wait until the page has finished loading, then a short pause, before fetching the chat. The
// widget is several hundred KB, and on a slow connection it would otherwise compete with the
// first screen for bandwidth.
const DELAY_AFTER_LOAD_MS = 2500;

export default function ChatWidget() {
  useEffect(() => {
    // Not while developing: it would count localhost as a visitor in the Tidio panel.
    if (!import.meta.env.PROD) return;
    if (document.querySelector('script[data-tidio]')) return;

    let timer: number | undefined;
    const load = () => {
      const script = document.createElement('script');
      script.src = TIDIO_SRC;
      script.async = true;
      script.setAttribute('data-tidio', '');
      document.body.appendChild(script);
    };
    const schedule = () => {
      timer = window.setTimeout(load, DELAY_AFTER_LOAD_MS);
    };

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      window.removeEventListener('load', schedule);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  return null;
}
