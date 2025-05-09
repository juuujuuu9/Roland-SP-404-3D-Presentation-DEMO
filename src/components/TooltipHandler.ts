import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface TooltipPoint {
    position: THREE.Vector3;
    label: string;
    id: string;
}

export class TooltipHandler {
    private tooltipPoints: TooltipPoint[];
    private raycaster: THREE.Raycaster;
    private model: THREE.Object3D | null;
    private camera: THREE.Camera;
    private controls: OrbitControls;
    private isAnimating: boolean = false;
    private originalControlsEnabled: boolean = true;
    private resetButton: HTMLButtonElement | null = null;

    constructor(camera: THREE.Camera, controls: OrbitControls) {
        this.camera = camera;
        this.controls = controls;
        this.tooltipPoints = [
            {
                position: new THREE.Vector3(0.5429, 1.0906, -0.0970),
                label: 'DC IN TerminalPower Supply, AC adaptor',
                id: 'tooltip-1'
            },
            {
                position: new THREE.Vector3(0.30140, 1.09616, -0.0794),
                label: 'USB Type-C (Audio, MIDI), USB bus power supply (USB Type-C port, 1.5 A ormore).',
                id: 'tooltip-2'
            },
            {
                position: new THREE.Vector3(-0.2646, 1.087401, -0.10182),
                label: 'LINE OUT jacks: 1/4-inch TRS phone type (impedance balanced), LINE IN jacks: 1/4-inch phone type (L/MONO, R).',
                id: 'tooltip-3'
            },
            {
                position: new THREE.Vector3(0.094890, 1.08771, -0.098782),
                label: 'MIDI (IN, OUT) jack: Stereo miniature phone type.',
                id: 'tooltip-4'
            },
            {
                position: new THREE.Vector3(-0.296527, -0.80068, 0.4114854),
                label: 'PHONES jacks: 1/4-inch phone type, Stereo miniature phone type.',
                id: 'tooltip-5'
            },
            {
                position: new THREE.Vector3(0.3973702, -0.80011, 0.403313),
                label: 'MIC/GUITAR IN jacks: 1/4-inch TRS phone type (for MIC), 1/4-inch phone type (for GUITAR).',
                id: 'tooltip-6'
            },
            {
                position: new THREE.Vector3(-0.00020325, 0.577558, 0.232059),
                label: 'Vivid OLED display for visual waveform editing, full menu access, customizable user design template, and support for importing your own startup logo and screensaver images.',
                id: 'tooltip-7'
            },
            {
                position: new THREE.Vector3(-0.0281230, -0.240824, 0.4284462),
                label: '17 velocity-sensitive, RGB pads with no-click design for smooth playability.',
                id: 'tooltip-8'
            },
            {
                position: new THREE.Vector3(0.5515076, 1.0490645, 0.1256213),
                label: 'Customize the look with the detachable metal faceplate.',
                id: 'tooltip-9'
            },
            {
                position: new THREE.Vector3(-0.386306, 0.5513043, 0.250242),
                label: 'Extensive onboard effects, including SP classics like Vinyl Simulator and DJFX Looper plus new Lo-fi, Cassette Simulator, and Resonator',
                id: 'tooltip-10'
            },
            {
                position: new THREE.Vector3(0.511137898, 0.21512472, 0.3105796),
                label: 'Blazing onboard sample editing with real-time or auto-chop mode, auto BPM detect, envelope, pitch shift, and resampling for layering sounds and phrases.',
                id: 'tooltip-11'
            },
            {
                position: new THREE.Vector3(-0.24108, 0.17122374, 0.320196),
                label: 'Updated resampling workflow for re-recording with various effects for detailed sound design.',
                id: 'tooltip-12'
            },
            {
                position: new THREE.Vector3(0.4074346, -0.1006333, 0.39778653),
                label: 'Bus FX for layering multiple effects, with customizable routing for creating intricate sound textures.',
                id: 'tooltip-13'
            }
        ];
        this.raycaster = new THREE.Raycaster();
        this.model = null;
        this.initializeTooltips();
        this.createResetButton();
    }

    private createResetButton() {
        this.resetButton = document.createElement('button');
        this.resetButton.textContent = '⬅  Zoom Out';
        this.resetButton.style.position = 'absolute';
        this.resetButton.style.bottom = '2rem';
        this.resetButton.style.left = '2rem';
        this.resetButton.style.zIndex = '1000';
        this.resetButton.style.padding = '10px 20px';
        this.resetButton.style.backgroundColor = '#ff5a00';
        this.resetButton.style.color = 'white';
        this.resetButton.style.border = 'none';
        this.resetButton.style.borderRadius = '5px';
        this.resetButton.style.cursor = 'pointer';
        this.resetButton.style.opacity = '0';
        this.resetButton.style.transition = 'opacity 0.3s ease';
        this.resetButton.style.pointerEvents = 'none';
        document.body.appendChild(this.resetButton);

        this.resetButton.onclick = () => {
            this.resetCamera();
        };
    }

    private showResetButton() {
        if (this.resetButton) {
            this.resetButton.style.opacity = '1';
            this.resetButton.style.pointerEvents = 'auto';
        }
    }

    private hideResetButton() {
        if (this.resetButton) {
            this.resetButton.style.opacity = '0';
            this.resetButton.style.pointerEvents = 'none';
        }
    }

    public setModel(model: THREE.Object3D) {
        this.model = model;
    }

    private initializeTooltips() {
        this.tooltipPoints.forEach(point => {
            const el = document.getElementById(point.id);
            if (el) {
                el.onclick = () => {
                    this.handleTooltipClick(point);
                };
            }
        });
    }

    private handleTooltipClick(point: TooltipPoint) {
        if (this.isAnimating) return;

        // Remove any existing label before showing a new one
        if (this.currentLabelRemove) {
            this.currentLabelRemove();
            this.currentLabelRemove = null;
        }

        // Store original camera position and target
        const originalPosition = this.camera.position.clone();
        const originalTarget = this.controls.target.clone();

        // Calculate new camera position (slightly offset from the tooltip point)
        const offset = new THREE.Vector3(0.5, 0.2, 0.5);
        const newPosition = point.position.clone().add(offset);
        const newTarget = point.position.clone();

        // Disable controls during animation
        this.originalControlsEnabled = this.controls.enabled;
        this.controls.enabled = false;
        this.isAnimating = true;

        // Show reset button when tooltip is clicked
        this.showResetButton();

        // Animation parameters
        const duration = 1000;
        const startTime = Date.now();

        // Animation function
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeInOutCubic)
            const easeProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Interpolate camera position and target
            this.camera.position.lerpVectors(originalPosition, newPosition, easeProgress);
            this.controls.target.lerpVectors(originalTarget, newTarget, easeProgress);
            this.controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                // Keep controls disabled and show reset button
                this.controls.enabled = false;
                this.showResetButton();
            }
        };

        // Start animation
        animate();

        // Create and show floating label
        const labelEl = document.createElement('div');
        labelEl.className = 'floating-label';
        labelEl.style.position = 'absolute';
        labelEl.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        labelEl.style.backdropFilter = 'blur(8px)';
        labelEl.style.WebkitBackdropFilter = 'blur(8px)'; // For Safari support
        labelEl.style.color = 'black';
        labelEl.style.padding = '5px 10px';
        labelEl.style.borderRadius = '10px';
        labelEl.style.maxWidth = '400px';
        labelEl.style.zIndex = '2000';
        labelEl.style.pointerEvents = 'none';
        labelEl.style.transition = 'opacity 0.3s ease';
        labelEl.style.opacity = '0';
        labelEl.style.fontFamily = '"proxima-nova", sans-serif';
        labelEl.style.fontSize = '2rem';
        labelEl.style.lineHeight = '1.4';
        labelEl.style.bottom = '6rem';
        labelEl.style.left = '2rem';
        labelEl.textContent = point.label;
        document.body.appendChild(labelEl);

        // Remove the old positioning code since we're using fixed positioning
        // const tooltipEl = document.getElementById(point.id);
        // if (tooltipEl) {
        //     const rect = tooltipEl.getBoundingClientRect();
        //     labelEl.style.left = `${rect.right + 10}px`;
        //     labelEl.style.top = `${rect.top}px`;
        // }

        // Fade in the label
        requestAnimationFrame(() => {
            labelEl.style.opacity = '1';
        });

        // Remove the label when resetting the camera or clicking a different tooltip
        const removeLabel = () => {
            labelEl.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(labelEl)) {
                    document.body.removeChild(labelEl);
                }
            }, 300);
        };

        // Store the removeLabel function for use in resetCamera
        this.currentLabelRemove = removeLabel;
    }

    private currentLabelRemove: (() => void) | null = null;

    public resetCamera() {
        if (this.isAnimating) return;

        // Remove the current label if it exists
        if (this.currentLabelRemove) {
            this.currentLabelRemove();
            this.currentLabelRemove = null;
        }

        // Store current position and target
        const currentPosition = this.camera.position.clone();
        const currentTarget = this.controls.target.clone();

        // Original camera position and target
        const originalPosition = new THREE.Vector3(0.95, 0.05, 3.08);
        const originalTarget = new THREE.Vector3(0.00, 0.00, 0.00);

        this.isAnimating = true;
        this.hideResetButton();

        // Animation parameters
        const duration = 1000;
        const startTime = Date.now();

        // Animation function
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Interpolate camera position and target
            this.camera.position.lerpVectors(currentPosition, originalPosition, easeProgress);
            this.controls.target.lerpVectors(currentTarget, originalTarget, easeProgress);
            this.controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                // Re-enable controls after animation
                this.controls.enabled = true;
                this.controls.update();
            }
        };

        // Start animation
        animate();
    }

    public updateTooltipPositions(camera: THREE.Camera) {
        this.tooltipPoints.forEach(point => {
            const vector = point.position.clone();
            vector.project(camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (1 - (vector.y * 0.5 + 0.5)) * window.innerHeight;
            const el = document.getElementById(point.id);
            if (!el) return;

            // Raycast from camera to tooltip point to check for occlusion
            const dir = point.position.clone().sub(camera.position).normalize();
            this.raycaster.set(camera.position, dir);
            if (this.model) {
                const intersects = this.raycaster.intersectObject(this.model, true);
                if (intersects.length > 0) {
                    const distToTooltip = point.position.distanceTo(camera.position);
                    const distToFirstHit = intersects[0].distance;
                    // If the first intersection is farther than the tooltip, the tooltip is visible
                    if (distToFirstHit >= distToTooltip - 0.01) { // 0.01 margin for float error
                        el.style.left = `${x}px`;
                        el.style.top = `${y}px`;
                        el.style.display = 'block';
                    } else {
                        el.style.display = 'none';
                    }
                } else {
                    // No intersection, show tooltip
                    el.style.left = `${x}px`;
                    el.style.top = `${y}px`;
                    el.style.display = 'block';
                }
            } else {
                // If no model is loaded yet, show tooltips anyway
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.style.display = 'block';
            }
        });
    }

    public addTooltip(position: THREE.Vector3, label: string, id: string) {
        this.tooltipPoints.push({ position, label, id });
        // Create the tooltip element
        const tooltip = document.createElement('div');
        tooltip.id = id;
        tooltip.className = 'dot-tooltip';
        tooltip.style.display = 'none';
        tooltip.onclick = () => this.handleTooltipClick({ position, label, id });
        document.body.appendChild(tooltip);
    }
} 