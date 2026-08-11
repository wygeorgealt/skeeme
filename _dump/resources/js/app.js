import './bootstrap';

document.addEventListener('alpine:init', () => {
    Alpine.data('discovery', (featureKey, dependsOn = null) => ({
        show: false,
        coords: { top: '0px', left: '0px' },
        init() {
            this.checkVisibility();
            window.addEventListener('discovery-update', () => this.checkVisibility());

            window.addEventListener('scroll', () => this.updatePosition(), true);
            window.addEventListener('resize', () => this.updatePosition());
        },
        updatePosition() {
            if (!this.show) return;
            const anchor = document.getElementById(`anchor_${featureKey}`);
            if (anchor) {
                const rect = anchor.getBoundingClientRect();
                this.coords.top = (rect.bottom + 12) + 'px';
                this.coords.left = (rect.right - 256) + 'px';
            }
        },
        checkVisibility() {
            if (this.show) return;
            if (localStorage.getItem(`discovery_${featureKey}_completed`)) return;

            // If it depends on another feature, wait until that one is completed
            if (dependsOn && !localStorage.getItem(`discovery_${dependsOn}_completed`)) return;

            const snoozedUntil = localStorage.getItem(`discovery_${featureKey}_snoozed`);
            if (snoozedUntil && Date.now() < parseInt(snoozedUntil)) return;

            setTimeout(() => {
                this.updatePosition();
                this.show = true;
            }, 600);
        },
        dismiss() {
            this.show = false;
            localStorage.setItem(`discovery_${featureKey}_snoozed`, Date.now() + 24 * 60 * 60 * 1000);
        },
        complete() {
            this.show = false;
            localStorage.setItem(`discovery_${featureKey}_completed`, 'true');
            window.dispatchEvent(new CustomEvent('discovery-update'));
        }
    }));
});
