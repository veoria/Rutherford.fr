// Shared motion policy for imported explanatory components.
window.ColorLoopMotion = (() => {
 const listeners = new Set(), mq = matchMedia('(prefers-reduced-motion: reduce)');
 const blocked = () => document.hidden || document.documentElement.dataset.motion === 'paused' || mq.matches;
 const notify = () => listeners.forEach(fn => fn());
 new MutationObserver(notify).observe(document.documentElement, {attributes:true,attributeFilter:['data-motion']});
 document.addEventListener('visibilitychange', notify); mq.addEventListener('change', notify);
 return {blocked, subscribe(fn){listeners.add(fn);fn();}};
})();
