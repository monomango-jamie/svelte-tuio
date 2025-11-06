<script lang="ts">
	import { draggable, type DraggableConfig } from '../directives/useDraggable.svelte';

	let isPushedUp = $state(false);
	let isPushedDown = $state(false);
	let message = $state('Drag me vertically!');
	let currentDelta = $state(0);

	const draggableConfig: DraggableConfig = {
		direction: 'y',
		sensitivity: 0.05, // 5% of screen height
		trackTangibles: true,
		onPushPositive: () => {
			isPushedDown = true;
			isPushedUp = false;
			message = '⬇️ Pushed Down!';
		},
		onPushNegative: () => {
			isPushedUp = true;
			isPushedDown = false;
			message = '⬆️ Pushed Up!';
		},
		onRelease: () => {
			isPushedUp = false;
			isPushedDown = false;
			message = 'Drag me vertically!';
			currentDelta = 0;
		}
	};
</script>

<div class="container">
	<div 
		class="draggable-box" 
		class:pushed-up={isPushedUp}
		class:pushed-down={isPushedDown}
		use:draggable={draggableConfig}
	>
		<h2>{message}</h2>
		<p>Delta: {currentDelta.toFixed(3)}</p>
		<p class="hint">
			{#if isPushedUp}
				Keep dragging up to increase the value!
			{:else if isPushedDown}
				Keep dragging down to increase the value!
			{:else}
				Place a tangible here and drag it up or down
			{/if}
		</p>
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
		padding: 2rem;
	}

	.draggable-box {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 3rem 2rem;
		border-radius: 1rem;
		min-width: 300px;
		text-align: center;
		transition: 
			transform 0.3s ease,
			box-shadow 0.3s ease,
			background 0.3s ease;
		cursor: grab;
		user-select: none;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.draggable-box:active {
		cursor: grabbing;
	}

	.draggable-box.pushed-up {
		transform: translateY(-10px) scale(1.05);
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		box-shadow: 0 15px 40px rgba(245, 87, 108, 0.4);
	}

	.draggable-box.pushed-down {
		transform: translateY(10px) scale(1.05);
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		box-shadow: 0 15px 40px rgba(0, 242, 254, 0.4);
	}

	h2 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
		font-weight: 700;
	}

	p {
		margin: 0.5rem 0;
		font-size: 1rem;
		opacity: 0.9;
	}

	.hint {
		margin-top: 1.5rem;
		font-size: 0.875rem;
		opacity: 0.8;
		font-style: italic;
	}
</style>

