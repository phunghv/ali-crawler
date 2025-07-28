console.info("inject a script")
window.dispatchEvent(new CustomEvent('FromPage', { detail: window._d_c_.lifeCycleEventList[0].data}));
