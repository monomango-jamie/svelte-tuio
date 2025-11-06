<script lang="ts">
	import { draggable, type DraggableConfig } from '../directives/useDraggable.svelte';

	let isPushedUp = $state(false);
	let isPushedDown = $state(false);
	let isActive = $state(false);
	let message = $state('Touch and drag me vertically!');
	let currentDelta = $state(0);

	const SENSITIVITY = 0.05; // 5% of screen height

	// Calculate visual offset (scale delta for smooth visual feedback)
	const visualOffset = $derived(currentDelta * 500); // Scale to pixels for visual effect

	const draggableConfig: DraggableConfig = {
		direction: 'y',
		sensitivity: SENSITIVITY,
		onMove: (delta: number) => {
			currentDelta = delta;
			isActive = true;

			// Update state based on sensitivity threshold
			if (delta >= SENSITIVITY) {
				isPushedDown = true;
				isPushedUp = false;
				message = '⬇️ Threshold Exceeded - Pushed Down!';
			} else if (delta <= -SENSITIVITY) {
				isPushedUp = true;
				isPushedDown = false;
				message = '⬆️ Threshold Exceeded - Pushed Up!';
			} else {
				isPushedUp = false;
				isPushedDown = false;
				message = 'Moving... (below threshold)';
			}
		},
		onPushPositive: () => {
			console.log('🔽 onPushPositive triggered');
		},
		onPushNegative: () => {
			console.log('🔼 onPushNegative triggered');
		},
		onRelease: () => {
			console.log('👋 onRelease triggered');
			isPushedUp = false;
			isPushedDown = false;
			isActive = false;
			message = 'Touch and drag me vertically!';
			currentDelta = 0;
		}
	};
</script>

<div class="container">
	<div class="info-panel">
		<h3>Draggable Action Demo</h3>
		<div class="stats">
			<div class="stat">
				<span class="label">Status:</span>
				<span class="value" class:active={isActive}>{isActive ? '🟢 Active' : '⚪ Idle'}</span>
			</div>
			<div class="stat">
				<span class="label">Delta:</span>
				<span class="value" class:positive={currentDelta > 0} class:negative={currentDelta < 0}>
					{currentDelta.toFixed(4)}
				</span>
			</div>
			<div class="stat">
				<span class="label">Threshold:</span>
				<span class="value">±{SENSITIVITY.toFixed(2)}</span>
			</div>
			<div class="stat">
				<span class="label">Exceeded:</span>
				<span class="value threshold-status" class:exceeded={isPushedUp || isPushedDown}>
					{isPushedUp || isPushedDown ? '✅ Yes' : '❌ No'}
				</span>
			</div>
		</div>
	</div>

	<div
		class="draggable-box"
		class:active={isActive}
		class:pushed-up={isPushedUp}
		class:pushed-down={isPushedDown}
		style="transform: translateY({visualOffset}px) scale({isActive ? 1.05 : 1})"
		use:draggable={draggableConfig}
	>
		<h2>{message}</h2>
		<div class="visual-indicator">
			<div class="threshold-line top">
				<span>Threshold ({-SENSITIVITY})</span>
			</div>
			<div class="center-line">
				<span>Start (0)</span>
			</div>
			<div class="threshold-line bottom">
				<span>Threshold (+{SENSITIVITY})</span>
			</div>
			<div class="position-marker" style="top: {50 + (currentDelta / SENSITIVITY) * 20}%"></div>
		</div>
		<p class="hint">
			{#if isPushedUp}
				🔼 Dragging up past threshold!
			{:else if isPushedDown}
				🔽 Dragging down past threshold!
			{:else if isActive}
				Moving but below threshold...
			{:else}
				Touch this area and drag up or down (2Dcur events)
			{/if}
		</p>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 600px;
		padding: 2rem;
		gap: 2rem;
	}

	.info-panel {
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		min-width: 400px;
	}

	.info-panel h3 {
		margin: 0 0 1rem 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #333;
	}

	.stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: #f8f9fa;
		border-radius: 0.5rem;
	}

	.stat .label {
		font-weight: 600;
		color: #666;
		font-size: 0.875rem;
	}

	.stat .value {
		font-family: 'Monaco', 'Courier New', monospace;
		font-weight: 700;
		color: #333;
		font-size: 1rem;
	}

	.stat .value.active {
		color: #10b981;
	}

	.stat .value.positive {
		color: #3b82f6;
	}

	.stat .value.negative {
		color: #ef4444;
	}

	.stat .value.threshold-status.exceeded {
		color: #10b981;
	}

	.draggable-box {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 3rem 2rem;
		border-radius: 1rem;
		min-width: 400px;
		text-align: center;
		transition:
			box-shadow 0.15s ease,
			background 0.2s ease;
		cursor: grab;
		user-select: none;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		position: relative;
		will-change: transform;
	}

	.draggable-box:active,
	.draggable-box.active {
		cursor: grabbing;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
	}

	.draggable-box.pushed-up {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		box-shadow: 0 20px 50px rgba(245, 87, 108, 0.5);
	}

	.draggable-box.pushed-down {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		box-shadow: 0 20px 50px rgba(0, 242, 254, 0.5);
	}

	h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.visual-indicator {
		position: relative;
		height: 120px;
		margin: 2rem 0;
		border-left: 3px solid rgba(255, 255, 255, 0.3);
		border-right: 3px solid rgba(255, 255, 255, 0.3);
	}

	.threshold-line,
	.center-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 2px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.threshold-line {
		background: rgba(255, 255, 255, 0.5);
	}

	.threshold-line.top {
		top: 10%;
	}

	.threshold-line.bottom {
		bottom: 10%;
	}

	.center-line {
		top: 50%;
		background: rgba(255, 255, 255, 0.8);
		height: 3px;
	}

	.threshold-line span,
	.center-line span {
		background: rgba(0, 0, 0, 0.3);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.position-marker {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		width: 20px;
		height: 20px;
		background: #fbbf24;
		border: 3px solid white;
		border-radius: 50%;
		transition: top 0.05s ease-out;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
	}

	p {
		margin: 0.5rem 0;
		font-size: 1rem;
		opacity: 0.9;
	}

	.hint {
		margin-top: 1.5rem;
		font-size: 0.875rem;
		opacity: 0.9;
		font-style: italic;
		font-weight: 600;
	}
</style>
