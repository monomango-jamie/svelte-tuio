<script lang="ts">
	import useTUIO from '../tuio-provider/useTUIO';

	let isPushedUp = $state(false);
	let isPushedDown = $state(false);
	let isActive = $state(false);
	let message = $state('Touch and drag me vertically!');
	let currentDelta = $state(0);
	
	const SENSITIVITY = 0.05; // 5% of screen height
	
	// Calculate visual offset (scale delta for smooth visual feedback)
	const visualOffset = $derived(currentDelta * 500); // Scale to pixels for visual effect

	const tuioHandler = useTUIO();
	let draggableBox = $state<HTMLDivElement | undefined>(undefined);
	let hasRegisteredTouchZone = $state(false);
	let initialPosition = $state<{ u: number; v: number } | null>(null);
	let activeTouchId = $state<number | null>(null);

	$effect(() => {
		if (draggableBox && !hasRegisteredTouchZone) {
			const rect = draggableBox.getBoundingClientRect();
			if (rect) {
				tuioHandler.registerTouchZone({
					id: 'draggable-demo',
					u: rect.left / window.innerWidth,
					v: 1 - rect.top / window.innerHeight - rect.height / window.innerHeight, // Invert v-coordinate
					normalisedWidth: rect.width / window.innerWidth,
					normalisedHeight: rect.height / window.innerHeight,
					onTouchStart: (touch) => {
						console.log('👆 Touch started:', touch);
						initialPosition = { u: touch.u, v: touch.v };
						activeTouchId = touch.id;
						isActive = true;
					},
					onTouchMove: (touch) => {
						if (activeTouchId === touch.id && initialPosition) {
							// Calculate delta in the y direction
							const delta = touch.v - initialPosition.v;
							currentDelta = delta;
							
							// Update state based on sensitivity threshold
							if (delta >= SENSITIVITY) {
								isPushedDown = true;
								isPushedUp = false;
								message = '⬇️ Threshold Exceeded - Pushed Down!';
								console.log('🔽 onPushPositive triggered');
							} else if (delta <= -SENSITIVITY) {
								isPushedUp = true;
								isPushedDown = false;
								message = '⬆️ Threshold Exceeded - Pushed Up!';
								console.log('🔼 onPushNegative triggered');
							} else {
								isPushedUp = false;
								isPushedDown = false;
								message = 'Moving... (below threshold)';
							}
						}
					},
					onTouchEnd: (touch) => {
						if (activeTouchId === touch.id) {
							console.log('👋 Touch ended');
							isPushedUp = false;
							isPushedDown = false;
							isActive = false;
							message = 'Touch and drag me vertically!';
							currentDelta = 0;
							initialPosition = null;
							activeTouchId = null;
						}
					}
				});
				hasRegisteredTouchZone = true;
			}
		}
	});
</script>

<div class="flex min-h-[600px] flex-col items-center justify-center gap-8 p-8">
	<!-- Info Panel -->
	<div class="min-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
		<h3 class="mb-4 text-xl font-bold text-gray-800">Draggable Touch Demo</h3>
		<div class="grid grid-cols-2 gap-4">
			<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
				<span class="text-sm font-semibold text-gray-600">Status:</span>
				<span class="font-mono text-base font-bold" class:text-green-600={isActive} class:text-gray-400={!isActive}>
					{isActive ? '🟢 Active' : '⚪ Idle'}
				</span>
			</div>
			<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
				<span class="text-sm font-semibold text-gray-600">Delta:</span>
				<span class="font-mono text-base font-bold" class:text-blue-600={currentDelta > 0} class:text-red-600={currentDelta < 0} class:text-gray-800={currentDelta === 0}>
					{currentDelta.toFixed(4)}
				</span>
			</div>
			<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
				<span class="text-sm font-semibold text-gray-600">Threshold:</span>
				<span class="font-mono text-base font-bold text-gray-800">±{SENSITIVITY.toFixed(2)}</span>
			</div>
			<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
				<span class="text-sm font-semibold text-gray-600">Exceeded:</span>
				<span class="font-mono text-base font-bold" class:text-green-600={isPushedUp || isPushedDown} class:text-gray-400={!isPushedUp && !isPushedDown}>
					{isPushedUp || isPushedDown ? '✅ Yes' : '❌ No'}
				</span>
			</div>
		</div>
	</div>

	<!-- Draggable Box -->
	<div
		bind:this={draggableBox}
		class="relative min-w-[400px] cursor-grab select-none rounded-2xl p-12 text-center text-white shadow-2xl transition-all duration-150 will-change-transform"
		class:cursor-grabbing={isActive}
		class:shadow-[0_20px_50px_rgba(0,0,0,0.3)]={isActive}
		class:bg-gradient-to-br={true}
		class:from-indigo-500={!isPushedUp && !isPushedDown}
		class:to-purple-600={!isPushedUp && !isPushedDown}
		class:from-pink-400={isPushedUp}
		class:to-red-500={isPushedUp}
		class:shadow-[0_20px_50px_rgba(245,87,108,0.5)]={isPushedUp}
		class:from-sky-400={isPushedDown}
		class:to-cyan-400={isPushedDown}
		class:shadow-[0_20px_50px_rgba(0,242,254,0.5)]={isPushedDown}
		style="transform: translateY({visualOffset}px) scale({isActive ? 1.05 : 1})"
	>
		<h2 class="mb-6 text-2xl font-bold">{message}</h2>
		
		<!-- Visual Indicator -->
		<div class="relative my-8 h-[120px] border-l-2 border-r-2 border-white/30">
			<!-- Threshold Line Top -->
			<div class="absolute left-0 right-0 top-[10%] flex h-0.5 items-center justify-center bg-white/50">
				<span class="rounded bg-black/30 px-2 py-1 text-xs font-semibold">Threshold ({-SENSITIVITY})</span>
			</div>
			
			<!-- Center Line -->
			<div class="absolute left-0 right-0 top-1/2 flex h-[3px] items-center justify-center bg-white/80">
				<span class="rounded bg-black/30 px-2 py-1 text-xs font-semibold">Start (0)</span>
			</div>
			
			<!-- Threshold Line Bottom -->
			<div class="absolute bottom-[10%] left-0 right-0 flex h-0.5 items-center justify-center bg-white/50">
				<span class="rounded bg-black/30 px-2 py-1 text-xs font-semibold">Threshold (+{SENSITIVITY})</span>
			</div>
			
			<!-- Position Marker -->
			<div
				class="absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white bg-yellow-400 shadow-lg transition-[top] duration-75 ease-out"
				style="top: {50 + (currentDelta / SENSITIVITY) * 20}%"
			></div>
		</div>
		
		<p class="mt-6 text-sm font-semibold italic opacity-90">
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
