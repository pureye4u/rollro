<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
  } from "firebase/firestore";
  import List, { Item, Text } from "@smui/list";

  import NavBarContainer from "../../../components/NavBarContainer.svelte";
  import RouteItem from "../../../components/RouteItem.svelte";
  import { db } from "$lib/firebase.client";
  import type { RouteMetaModel } from "../../../models/RouteModel";
  import { canView } from "../../../services/routeService";

  export let data;

  let isLoading = true;
  let targetUserId: string | null = null;
  let currentUserId: string | null = null;
  let displayNickname = "알 수 없음";
  let visibleRoutes: RouteMetaModel[] = [];

  const FALLBACK_NICKNAME = "알 수 없음";

  $: isOwnProfile = !!currentUserId && currentUserId === targetUserId;

  onMount(async () => {
    targetUserId = get(page)?.params?.id ?? null;

    if (!targetUserId) {
      isLoading = false;
      return;
    }

    const user: any = await data?.getAuthUser?.();
    currentUserId = user?.uid ?? null;

    await Promise.all([
      loadNickname(targetUserId),
      loadRoutes(targetUserId, currentUserId),
    ]);

    isLoading = false;
  });

  async function loadNickname(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, "user", userId));
      if (userDoc.exists()) {
        const nickname = userDoc.data()?.nickname;
        displayNickname = nickname || FALLBACK_NICKNAME;
      } else {
        displayNickname = FALLBACK_NICKNAME;
      }
    } catch (error) {
      console.error(`Error fetching nickname for ${userId}:`, error);
      displayNickname = FALLBACK_NICKNAME;
    }
  }

  async function loadRoutes(ownerId: string, viewerId: string | null) {
    try {
      const routeRef = collection(db, "route-meta");
      const routeQuery = query(routeRef, where("owner", "==", ownerId));
      const snapshot = await getDocs(routeQuery);

      const fetchedRoutes = snapshot.docs
        .map(
          (docSnap) =>
            ({ id: docSnap.id, ...docSnap.data() }) as RouteMetaModel,
        )
        .filter((route) => canView(route, viewerId ?? undefined))
        .sort((a, b) => {
          const titleA = a.title || "";
          const titleB = b.title || "";
          return titleA.localeCompare(titleB);
        });

      visibleRoutes = fetchedRoutes;
    } catch (error) {
      console.error(`Error fetching routes for ${ownerId}:`, error);
      visibleRoutes = [];
    }
  }

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
</script>

<NavBarContainer>
  <div class="user-page-container">
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
      </div>
    {:else}
      <div class="profile-header">
        <h1 class="nickname">{displayNickname}</h1>
        {#if isOwnProfile}
          <span class="profile-badge">내 프로필</span>
        {/if}
      </div>

      {#if visibleRoutes.length > 0}
        <div class="route-list-content">
          <List class="route-list" dense>
            {#each visibleRoutes as route (route.id)}
              <RouteItem
                {route}
                {currentUserId}
                showOwner={false}
                on:SMUI:action={() => goto(`/route/${route.id}`)}
              />
            {/each}
          </List>
        </div>
      {:else}
        <div class="empty-state">
          <p>표시할 여정이 없습니다.</p>
        </div>
      {/if}
    {/if}
  </div>
</NavBarContainer>

<style>
  .user-page-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 64px); /* Fixed height */
    padding: 16px;
    box-sizing: border-box;
    overflow: hidden; /* Hide overflow */
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .nickname {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }

  .profile-badge {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 12px;
    background-color: #6200ee;
    color: #fff;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 200px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #6200ee;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .route-list-content {
    flex: 1 1 auto;
    overflow-y: auto;
    overflow-x: hidden; /* Prevent horizontal scroll */
    margin-bottom: 80px;
    min-height: 200px;
    width: 100%;
    box-sizing: border-box;
  }

  :global(.route-list-content .mdc-deprecated-list) {
    padding: 0;
    width: 100%; /* Ensure list takes full width */
    box-sizing: border-box;
  }

  :global(.route-list-content .mdc-deprecated-list-item) {
    height: auto;
    min-height: 56px;
    padding: 0;
    width: 100%; /* Ensure item takes full width */
    box-sizing: border-box;
  }

  :global(.route-list .mdc-deprecated-list-item__text) {
    width: 100%;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #666;
  }

  .empty-state p {
    margin-top: 16px;
    font-size: 16px;
  }
</style>
