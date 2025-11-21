<script lang="ts">
    import { Item, Text } from "@smui/list";
    import Ripple from "@smui/ripple";
    import { createEventDispatcher } from "svelte";

    export let route: any;
    export let currentUserId: string | null = null;
    export let ownerName: string = "";
    export let showOwner: boolean = false;

    const dispatch = createEventDispatcher();

    function formatExecutedDate(dateString: string): string {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}.${month}.${day}`;
        } catch (error) {
            return dateString;
        }
    }

    function handleOwnerClick(e: MouseEvent | KeyboardEvent) {
        e.stopPropagation();
        dispatch("ownerClick", { originalEvent: e, ownerId: route.owner });
    }

    function stopRipplePropagation(e: Event) {
        e.stopPropagation();
    }
</script>

<Item on:SMUI:action class="route-list-item" ripple={false}>
    <Text class="route-text-container">
        <div class="route-card" use:Ripple={{ surface: true }}>
            <div class="route-main-content">
                <div class="title-row">
                    <span class="route-title">{route.title || "제목 없음"}</span
                    >
                    {#if route.executedDate}
                        <span class="route-date"
                            >{formatExecutedDate(route.executedDate)}</span
                        >
                    {/if}
                </div>

                <div class="meta-row">
                    <div class="meta-left">
                        {#if showOwner && route.owner}
                            {#if route.owner === currentUserId}
                                <span class="owner-name owner-self">
                                    {ownerName || "로딩 중..."}
                                </span>
                            {:else}
                                <button
                                    type="button"
                                    class="owner-name clickable"
                                    on:click={handleOwnerClick}
                                    on:mousedown={stopRipplePropagation}
                                    on:touchstart={stopRipplePropagation}
                                    on:pointerdown={stopRipplePropagation}
                                    on:keypress={(e) => {
                                        if (e.key === "Enter" || e.key === " ")
                                            handleOwnerClick(e);
                                    }}
                                >
                                    {ownerName || "로딩 중..."}
                                    <span class="material-icons menu-indicator"
                                        >expand_more</span
                                    >
                                </button>
                            {/if}
                            <span class="separator">•</span>
                        {/if}

                        <span class="point-count"
                            >{route.pointsCount || 0}개 지점</span
                        >
                    </div>
                </div>
            </div>

            <div class="badges">
                {#if route.owner === currentUserId}
                    <span class="badge owner">소유자</span>
                {:else if route.editors && route.editors.includes(currentUserId)}
                    <span class="badge editor">편집 가능</span>
                {:else if route.viewers && route.viewers.includes(currentUserId)}
                    <span class="badge viewer">보기 전용</span>
                {:else if route.isPublic}
                    <span class="badge public">공개</span>
                {/if}
            </div>

            <div class="arrow-icon">
                <span class="material-icons">chevron_right</span>
            </div>
        </div>
    </Text>
</Item>

<style>
    /* Override SMUI Item styles for custom layout */
    :global(.route-list-item) {
        height: auto !important;
        padding: 0 !important; /* Remove padding to let card handle spacing */
        margin-bottom: 0 !important; /* Margin handled by card */
        overflow: visible !important;
        background-color: transparent !important; /* Ensure Item is transparent */
    }

    :global(.route-text-container) {
        width: 100%;
        overflow: visible !important;
    }

    .route-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        /* width: 100%; Removed to prevent overflow with margin */
        flex: 1; /* Use flex to fill width */
        padding: 16px 20px;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        box-sizing: border-box; /* Ensure border is included in width */
        margin: 4px 8px 8px 8px; /* Spacing between items */
        position: relative; /* For ripple positioning */
        overflow: hidden; /* Clip ripple to border radius */
        --mdc-ripple-color: var(
            --color-primary,
            #1a73e8
        ); /* Custom ripple color */
    }

    .route-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-color: var(--color-primary, #1a73e8);
        z-index: 1; /* Bring to front on hover */
        position: relative;
    }

    .route-main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0; /* For text truncation */
    }

    .title-row {
        display: flex;
        align-items: baseline;
        gap: 12px;
    }

    .route-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-text-heading, #202124);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .route-date {
        font-size: 0.85rem;
        color: var(--color-text-muted, #9aa0a6);
        font-weight: 400;
    }

    .meta-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.9rem;
    }

    .meta-left {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--color-text-body, #5f6368);
    }

    .separator {
        color: #dadce0;
    }

    .owner-name {
        font-weight: 500;
        color: var(--color-text-body, #5f6368);
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .owner-name.clickable {
        background: none;
        border: none;
        padding: 2px 6px;
        cursor: pointer;
        color: var(--color-primary, #1a73e8); /* Changed to primary color */
        transition: all 0.2s;
        border-radius: 4px;
    }

    .owner-name.clickable:hover {
        background-color: rgba(
            26,
            115,
            232,
            0.08
        ); /* Subtle background on hover */
        text-decoration: none; /* Remove underline */
    }

    .owner-name.owner-self {
        color: var(--color-text-muted, #9aa0a6); /* Changed to muted color */
        font-weight: 500;
    }

    .menu-indicator {
        font-size: 16px;
        opacity: 0.7;
    }

    .owner-name.clickable:hover .menu-indicator {
        opacity: 1;
    }

    .badges {
        display: flex;
        gap: 6px;
        flex-shrink: 0; /* Prevent shrinking */
        margin-left: 16px; /* Add spacing from content */
    }

    .badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
    }

    .badge.owner {
        background-color: #e8f0fe;
        color: #1a73e8;
    }

    .badge.editor {
        background-color: #f3e8fd;
        color: #9333ea;
    }

    .badge.viewer {
        background-color: #f1f3f4;
        color: #5f6368;
    }

    .badge.public {
        background-color: #e6f4ea;
        color: #137333;
    }

    .point-count {
        color: var(--color-text-muted, #9aa0a6);
        font-size: 0.85rem;
    }

    .arrow-icon {
        margin-left: 16px;
        color: #dadce0;
        display: flex;
        align-items: center;
        transition:
            transform 0.2s ease,
            color 0.2s ease;
    }

    .route-card:hover .arrow-icon {
        color: var(--color-primary, #1a73e8);
        transform: translateX(4px);
    }
</style>
