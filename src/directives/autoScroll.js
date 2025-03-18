export const vAutoScroll = {
    mounted: (el, binding) => {
        // Opzione per disabilitare temporaneamente l'auto-scroll
        let isEnabled = true;

        el.addEventListener('wheel', () => {
            // Disabilita l'auto-scroll se l'utente fa scroll manualmente
            isEnabled = el.scrollTop + el.clientHeight === el.scrollHeight;
        });

        const observer = new MutationObserver(() => {
            if (isEnabled) {
                el.scrollTop = el.scrollHeight;
            }
        });

        observer.observe(el, {
            childList: true,
            subtree: true
        });
    }
}