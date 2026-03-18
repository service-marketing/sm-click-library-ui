<script setup>
import {
  inject,
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import Avatar from "../Avatar.vue";

const props = defineProps({
  selectedAttendant: { type: Object, required: true },
  attendant: { type: Object, required: true },
  participantsGroup: { type: Array, default: () => [] },
  participantCount: { type: Number, default: 0 },
});

const emit = defineEmits(["close"]);

// --- Injects recebidos de ChatWindow ---
const useChat = inject("useChat");
// --------------------------------------

const handleEditGroup = () => {
  if (!isAdmin.value) return;

  if (typeof useChat.openCreateOrEdit !== "function") return;
  useChat.openCreateOrEdit("edit", props.selectedAttendant);
};

const handleRemoveParticipant = async (participant) => {
  if (!participant) return;
  if (participant.id === props.attendant?.id) return;

  if (typeof useChat.removeGroupParticipant !== "function") return;

  await useChat.removeGroupParticipant(
    props.selectedAttendant?.internal_chat?.channel_id,
    participant.id
  );
};

const loadingLeaveGroup = ref(false);
const showLeaveConfirmation = ref(false);
const activeTooltipTrigger = ref(null);
const showActionTooltip = ref(false);
const actionTooltipStyle = ref({});
const actionTooltipMessage = ref("");

const updateActionTooltipPosition = () => {
  if (!activeTooltipTrigger.value) return;

  const rect = activeTooltipTrigger.value.getBoundingClientRect();
  const tooltipWidth = 240;
  const spacing = 8;
  const maxLeft = Math.max(spacing, window.innerWidth - tooltipWidth - spacing);
  const left = Math.min(Math.max(spacing, rect.right + spacing), maxLeft);
  const top = rect.top + rect.height / 2;

  actionTooltipStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  };
};

const openActionTooltip = async (event, message) => {
  if (!message) return;

  activeTooltipTrigger.value = event.currentTarget;
  actionTooltipMessage.value = message;
  showActionTooltip.value = true;
  await nextTick();
  updateActionTooltipPosition();
};

const closeActionTooltip = () => {
  showActionTooltip.value = false;
  activeTooltipTrigger.value = null;
  actionTooltipMessage.value = "";
};

const syncTooltipPosition = () => {
  if (!showActionTooltip.value) return;
  updateActionTooltipPosition();
};

const openLeaveConfirmation = () => {
  showLeaveConfirmation.value = true;
};

const closeLeaveConfirmation = () => {
  showLeaveConfirmation.value = false;
};

const handleLeaveGroup = async () => {
  loadingLeaveGroup.value = true;
  const channelId = props.selectedAttendant?.internal_chat?.channel_id;
  if (!channelId) return;
  if (typeof useChat.leaveGroup !== "function") return;

  const hasLeftGroup = await useChat.leaveGroup(channelId);
  if (!hasLeftGroup) {
    loadingLeaveGroup.value = false;
    closeLeaveConfirmation();
    return;
  }

  emit("close");

  if (typeof useChat.closeSelectedChat === "function") {
    useChat.closeSelectedChat();
  }
  loadingLeaveGroup.value = false;
  closeLeaveConfirmation();
};

const isAdmin = computed(() => {
  return props.selectedAttendant.group_created_by === props.attendant.id;
});

const groupAdmin = computed(() => {
  const creator = props.participantsGroup.find(
    (item) => props.selectedAttendant.group_created_by === item.id
  );

  return creator ? creator.name : "Desconhecido";
});

const editMembersTooltipMessage = computed(() => {
  if (isAdmin.value) return "";

  return `Você não é o administrador do grupo. Somente ${groupAdmin.value} pode ajustar os membros.`;
});

const getRemoveParticipantTooltipMessage = (participant) => {
  if (participant?.id === props.attendant?.id) {
    return "Você não pode remover a si mesmo do grupo.";
  }

  if (!isAdmin.value) {
    return `Você não é o administrador do grupo. Somente ${groupAdmin.value} pode remover membros.`;
  }

  return "";
};

onMounted(() => {
  window.addEventListener("resize", syncTooltipPosition);
  window.addEventListener("scroll", syncTooltipPosition, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncTooltipPosition);
  window.removeEventListener("scroll", syncTooltipPosition, true);
});
</script>

<template>
  <span
    class="absolute right-0 top-0 z-20 flex size-full flex-col gap-2 overflow-hidden rounded-md bg-base-200"
  >
    <span class="flex items-center">
      <button class="p-2" @click="emit('close')">
        <svg
          class="size-6"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z"
          ></path>
        </svg>
      </button>

      <p class="text-sm font-medium">Informações do grupo</p>
    </span>

    <div class="flex w-full shrink-0 flex-col items-center gap-1.5">
      <Avatar :style="'size-24'" :url="selectedAttendant.photo">
        <svg
          class="size-24"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
            clip-rule="evenodd"
          />
        </svg>
      </Avatar>

      <h1 class="text-lg font-normal">{{ selectedAttendant.name }}</h1>

      <h2 class="text-sm font-sans text-gray-500">
        Grupo •
        <a class="text-primary"> {{ participantCount }} membros</a>
      </h2>

      <h3 class="text-sm font-sans text-gray-500">
        Criado por {{ groupAdmin }}, 10/09/1998
      </h3>
    </div>

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="min-h-0 flex-1 overflow-y-auto">
        <!-- Botão de ajustar membros -->
        <li class="relative">
          <button
            :aria-disabled="!isAdmin"
            class="bg-base-100 flex w-full items-center gap-2 p-2 text-left hover:bg-gray-800 hover:text-primary"
            :class="!isAdmin && 'cursor-not-allowed opacity-70'"
            @click="handleEditGroup"
            @mouseenter="openActionTooltip($event, editMembersTooltipMessage)"
            @mouseleave="closeActionTooltip"
            @focus="openActionTooltip($event, editMembersTooltipMessage)"
            @blur="closeActionTooltip"
          >
            <span class="flex items-center gap-2">
              <div
                class="bg-base-300 size-10 rounded-full flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 15 14"
                  fill="currentColor"
                  class="size-5"
                >
                  <path
                    d="M11 7.99951C12.6568 7.99951 13.9998 9.3428 14 10.9995C14 12.6564 12.6569 13.9995 11 13.9995C9.3431 13.9995 8 12.6564 8 10.9995C8.00022 9.3428 9.34323 7.99951 11 7.99951ZM11 9.42725C10.9204 9.42725 10.8443 9.45888 10.7881 9.51514C10.7318 9.5714 10.7002 9.64749 10.7002 9.72705V10.6997H9.72754C9.64797 10.6997 9.57091 10.7313 9.51465 10.7876C9.45852 10.8438 9.42686 10.9201 9.42676 10.9995C9.42676 11.0791 9.45839 11.1561 9.51465 11.2124C9.57091 11.2687 9.64798 11.3003 9.72754 11.3003H10.7002V12.2729C10.7002 12.3525 10.7319 12.4286 10.7881 12.4849C10.8443 12.5411 10.9205 12.5728 11 12.5728C11.0795 12.5728 11.1557 12.5411 11.2119 12.4849C11.2681 12.4286 11.2998 12.3525 11.2998 12.2729V11.3003H12.2725C12.352 11.3003 12.4291 11.2687 12.4854 11.2124C12.5416 11.1561 12.5732 11.0791 12.5732 10.9995C12.5731 10.9201 12.5415 10.8438 12.4854 10.7876C12.4291 10.7313 12.352 10.6997 12.2725 10.6997H11.2998V9.72705C11.2998 9.64749 11.2682 9.5714 11.2119 9.51514C11.1557 9.45888 11.0796 9.42725 11 9.42725ZM8.625 7.50049C8.75546 7.50049 8.88472 7.51114 9.0127 7.52783C7.81025 8.21758 7.00015 9.51391 7 10.9995C7.00001 11.3446 7.04378 11.68 7.12598 11.9995H4.875C4.47733 11.9995 4.09573 11.8421 3.81445 11.561C3.53317 11.2798 3.37502 10.8973 3.375 10.4995C3.37513 9.7041 3.69144 8.94088 4.25391 8.37842C4.81649 7.81602 5.57949 7.50049 6.375 7.50049H8.625ZM3.8252 6.00049C3.92718 6.20013 4.04571 6.39131 4.17871 6.57178C3.47999 6.96241 2.89804 7.53261 2.49316 8.22314C2.0884 8.91353 1.87473 9.69923 1.875 10.4995H1.5C1.10231 10.4995 0.720731 10.3422 0.439453 10.061C0.158267 9.77986 0.000133157 9.39811 0 9.00049C0 8.2049 0.316324 7.44099 0.878906 6.87842C1.44148 6.31605 2.20451 6.00049 3 6.00049H3.8252ZM12 6.00049C12.7955 6.00049 13.5585 6.31605 14.1211 6.87842C14.6837 7.44099 15 8.2049 15 9.00049C14.9999 9.26491 14.9283 9.52124 14.7988 9.74658C14.3222 8.30098 13.0442 7.22072 11.4902 7.03076C11.2822 6.85894 11.0587 6.7045 10.8213 6.57178C10.9543 6.39131 11.0728 6.20013 11.1748 6.00049H12ZM7.5 1.50049C8.19619 1.50049 8.86416 1.77679 9.35645 2.26904C9.84868 2.76129 10.125 3.42937 10.125 4.12549C10.1249 4.82139 9.84845 5.48879 9.35645 5.98096C8.86417 6.47319 8.19617 6.75049 7.5 6.75049C7.15529 6.75049 6.81359 6.6822 6.49512 6.55029C6.17678 6.41839 5.88722 6.2246 5.64355 5.98096C5.39999 5.73731 5.20705 5.44767 5.0752 5.12939C4.94337 4.81107 4.87503 4.47002 4.875 4.12549C4.875 3.78081 4.9433 3.43905 5.0752 3.12061C5.2071 2.80231 5.39992 2.51268 5.64355 2.26904C5.88719 2.02542 6.17682 1.83259 6.49512 1.70068C6.8136 1.56877 7.15528 1.50049 7.5 1.50049ZM4.27539 0.00439453C4.75237 0.0318198 5.21314 0.188708 5.60742 0.458496C4.77299 0.888977 4.11076 1.5917 3.72949 2.44971C3.34824 3.3078 3.27087 4.2704 3.51074 5.17822C2.93768 5.04016 2.42723 4.71353 2.0625 4.25049C1.69784 3.78747 1.49997 3.21485 1.5 2.62549C1.49989 2.14763 1.63021 1.67828 1.87695 1.26904C2.12371 0.859923 2.47779 0.526133 2.90039 0.303223C3.32301 0.0803171 3.79837 -0.0229799 4.27539 0.00439453ZM10.4512 0.0356445C10.8309 -0.0261991 11.2197 -0.00395918 11.5898 0.101074C11.96 0.206149 12.3031 0.39091 12.5938 0.643066C12.8844 0.895214 13.1162 1.20846 13.2725 1.56006C13.4287 1.91163 13.5057 2.29359 13.498 2.67822C13.4904 3.06286 13.3976 3.44154 13.2275 3.78662C13.0575 4.1315 12.8139 4.43501 12.5137 4.67529C12.2136 4.91544 11.8638 5.0859 11.4902 5.17627C11.728 4.26901 11.6504 3.3078 11.2695 2.45068C10.8883 1.59293 10.2262 0.889932 9.39258 0.458496C9.71014 0.241574 10.0716 0.0974964 10.4512 0.0356445Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <p>Ajustar membros do grupo</p>
            </span>
          </button>
        </li>

        <!-- Lista de participantes reais -->
        <li
          v-for="participant in participantsGroup"
          :key="participant.id"
          class="bg-base-100 flex items-center gap-2 p-2 even:bg-base-300"
        >
          <div class="flex w-full items-center justify-between">
            <span class="flex items-center gap-2">
              <Avatar :url="participant.photo" />
              <p>{{ participant.name }}</p>
            </span>

            <button
              class="rounded-md p-0.5 text-sm w-20"
              :disabled="!isAdmin"
              :class="
                participant.id === attendant.id
                  ? 'bg-primary hover:bg-primary'
                  : 'bg-red-500 hover:bg-red-800'
              "
              @click="handleRemoveParticipant(participant)"
              @mouseenter="
                openActionTooltip(
                  $event,
                  getRemoveParticipantTooltipMessage(participant)
                )
              "
              @mouseleave="closeActionTooltip"
              @focus="
                openActionTooltip(
                  $event,
                  getRemoveParticipantTooltipMessage(participant)
                )
              "
              @blur="closeActionTooltip"
            >
              {{ participant.id === attendant.id ? "Eu" : "Remover" }}
            </button>
          </div>
        </li>
      </div>
    </div>

    <Teleport to="body">
      <span
        v-if="showActionTooltip"
        class="pointer-events-none fixed z-[9999] w-60 -translate-y-1/2 rounded-md bg-base-300 p-2 text-center text-sm text-gray-500 shadow-lg"
        :style="actionTooltipStyle"
      >
        <p>{{ actionTooltipMessage }}</p>
      </span>
    </Teleport>

    <!-- Confirmação inline para sair do grupo -->
    <div v-if="showLeaveConfirmation" class="flex gap-1 m-1">
      <button
        class="flex-1 rounded-lg bg-base-300 hover:bg-base-100 p-1 h-10 flex items-center justify-center text-sm font-medium"
        @click="closeLeaveConfirmation"
        :disabled="loadingLeaveGroup"
      >
        Cancelar
      </button>
      <button
        class="flex-1 rounded-lg bg-red-600 hover:bg-red-700 p-1 h-10 flex items-center justify-center text-sm font-semibold"
        @click="handleLeaveGroup"
        :disabled="loadingLeaveGroup"
      >
        <div class="loader-sm" v-if="loadingLeaveGroup" />
        <span v-else>Confirmar saída</span>
      </button>
    </div>

    <button
      v-else
      class="rounded-lg bg-base-100 p-1 h-10 flex items-center justify-center m-1 hover:bg-red-700"
      @click="openLeaveConfirmation"
    >
      <p class="text-sm font-semibold">Sair do grupo</p>
    </button>
  </span>
</template>



<style scoped>
.loader {
  width: 25px;
  height: 25px;
  border: 5px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

.loader-sm {
  width: 18px;
  height: 18px;
  border: 3px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>