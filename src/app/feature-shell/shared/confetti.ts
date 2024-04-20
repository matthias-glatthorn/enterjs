import { confetti } from 'tsparticles-confetti';

export async function triggerConfetti(element: Element) {
    const bcr = element.getBoundingClientRect();
    const xRatio = 100 / window.innerWidth;
    const yRatio = 100 / window.innerHeight;

    confetti("tsparticles", {
        position: {
            x: (bcr.x + (bcr.width / 2)) * xRatio,
            y: (bcr.y + (bcr.height / 2)) * yRatio,
        },
    });
}