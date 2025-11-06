<script lang="ts">
	import useTUIO from '$lib/tuio-provider/useTUIO';
	const tuioHandler = useTUIO();

	const isConnected = $derived(tuioHandler.svelteSocket.connectionStatus === WebSocket.OPEN);
</script>

<div class="max-w-full overflow-x-auto p-4 font-mono">
	<h1 class="mb-6 text-3xl font-bold text-gray-800">TUIO Debugger</h1>

	<!-- Connection Status -->
	<section class="mb-8 rounded-lg bg-gray-100 p-4">
		<h2 class="mb-4 text-xl font-semibold text-gray-700">Connection Status</h2>
		<div class="overflow-hidden rounded shadow-sm">
			<table class="w-full border-collapse bg-white">
				<tbody>
					<tr class="hover:bg-gray-50">
						<td class="border-b border-gray-200 p-3">
							<strong>Socket Connected:</strong>
						</td>
						<td
							class="border-b border-gray-200 p-3 font-bold"
							class:text-green-600={isConnected}
							class:text-red-600={!isConnected}
						>
							{isConnected ? '✓ Connected' : '✗ Disconnected'}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Tangibles Manager -->
	<section class="mb-8 rounded-lg bg-gray-100 p-4">
		<h2 class="mb-4 text-xl font-semibold text-gray-700">
			Tangibles & Touches ({tuioHandler.tangiblesManager.tangibles.length})
		</h2>
		{#if tuioHandler.tangiblesManager.tangibles.length > 0}
			<div class="overflow-hidden rounded shadow-sm">
				<table class="w-full border-collapse bg-white">
					<thead class="bg-gray-700 text-white">
						<tr>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">
								Class ID
							</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">ID</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">Profile</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">
								Position (u, v)
							</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">
								Rotation (Z)
							</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">
								Velocity (X, Y)
							</th>
						</tr>
					</thead>
					<tbody>
						{#each tuioHandler.tangiblesManager.tangibles as tangible}
							<tr class="hover:bg-gray-50">
								<td class="border-b border-gray-200 p-3">{tangible.classId}</td>
								<td class="border-b border-gray-200 p-3">{tangible.id}</td>
								<td class="border-b border-gray-200 p-3">{tangible.profile}</td>
								<td class="border-b border-gray-200 p-3">
									{tangible.u.toFixed(3)}, {tangible.v.toFixed(3)}
								</td>
								<td class="border-b border-gray-200 p-3">
									{tangible.angleZ?.toFixed(2) ?? 'N/A'}
								</td>
								<td class="border-b border-gray-200 p-3">
									{tangible.velocityX?.toFixed(3) ?? 0}, {tangible.velocityY?.toFixed(3) ?? 0}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="my-4 text-gray-600 italic">No tangibles or touches detected</p>
		{/if}
	</section>

	<!-- Tangible Class IDs -->
	<section class="mb-8 rounded-lg bg-gray-100 p-4">
		<h2 class="mb-4 text-xl font-semibold text-gray-700">
			Active Class IDs ({tuioHandler.tangiblesManager.tangibleClassIds.length})
		</h2>
		{#if tuioHandler.tangiblesManager.tangibleClassIds.length > 0}
			<div class="overflow-hidden rounded shadow-sm">
				<table class="w-full border-collapse bg-white">
					<thead class="bg-gray-700 text-white">
						<tr>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">Index</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">
								Class ID
							</th>
						</tr>
					</thead>
					<tbody>
						{#each tuioHandler.tangiblesManager.tangibleClassIds as classId, index}
							<tr class="hover:bg-gray-50">
								<td class="border-b border-gray-200 p-3">{index}</td>
								<td class="border-b border-gray-200 p-3">{classId}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="my-4 text-gray-600 italic">No active class IDs</p>
		{/if}
	</section>

	<!-- Touch Zones -->
	<section class="mb-8 rounded-lg bg-gray-100 p-4">
		<h2 class="mb-4 text-xl font-semibold text-gray-700">
			Touch Zones ({tuioHandler.touchZones.length})
		</h2>
		{#if tuioHandler.touchZones.length > 0}
			<div class="overflow-hidden rounded shadow-sm">
				<table class="w-full border-collapse bg-white">
					<thead class="bg-gray-700 text-white">
						<tr>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">ID</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">
								Position (u, v)
							</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">
								Size (w × h)
							</th>
							<th class="p-3 text-left text-xs font-semibold tracking-wider uppercase">
								Handlers
							</th>
						</tr>
					</thead>
					<tbody>
						{#each tuioHandler.touchZones as zone}
							<tr class="hover:bg-gray-50">
								<td class="border-b border-gray-200 p-3">{zone.id}</td>
								<td class="border-b border-gray-200 p-3">
									{zone.u.toFixed(3)}, {zone.v.toFixed(3)}
								</td>
								<td class="border-b border-gray-200 p-3">
									{zone.normalisedWidth.toFixed(3)} × {zone.normalisedHeight.toFixed(3)}
								</td>
								<td class="border-b border-gray-200 p-3">
									{[
										zone.onPlaceTangible ? 'place' : null,
										zone.onRemoveTangible ? 'remove' : null,
										zone.onMoveTangible ? 'move' : null,
										zone.onTouchStart ? 'start' : null,
										zone.onTouchEnd ? 'end' : null
									]
										.filter(Boolean)
										.join(', ') || 'none'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="my-4 text-gray-600 italic">No touch zones registered</p>
		{/if}
	</section>
</div>
