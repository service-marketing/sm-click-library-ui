<script setup>
import { ref } from "vue";
import primarySelect from "~/components/selects/primary_select/primary_select.vue";
import chartsSelect from "~/components/selects/chart_direction_select/chart_direction_select.vue";
import simpleModal from "~/components/modals/simple_modal/simple_modal.vue";
import simpleCard from "~/components/cards/simple_card/simple_card.vue";
import instanceSelect from "~/components/selects/instance_select/index.vue";
import calendar from "./components/calendar/calendar.vue";
import MFA from "./components/mfa/mfa.vue";
import MfaQrCode from "./components/mfa/mfaQrCode.vue";
import departSelect from "./components/selects/departmentSelect/departSelect.vue";
import attendantSelect from "./components/selects/attendantSelect/attendantSelect.vue";
import chatWindow from "./components/intern-chat/chatWindow.vue";
import mobileChatWindow from "./components/intern-chat/mobileChatWindow.vue";
import FilterSelect from "./components/selects/filterSelect/filterSelect.vue";
import RandomAvatar from "./components/avatar/randomAvatar.vue";
import MinModal from "./components/modals/min_modal/min_modal.vue";
</script>

<template>
  <main class="h-screen w-screen justify-center items-center flex">
    <div class="w-full justify-center flex">
      <MinModal>
        <template v-slot:header>
          <div class="text-white flex justify-between w-full px-3 items-center">
            <h3 class="font-semibold text-white">Receber Comissões</h3>
          </div>
        </template>

        <template v-slot:body>
          <thead>
            <tr
              class="bg-sky-800  text-current uppercase text-sm leading-normal"
            >
              <th class="py-2 px-6 text-center">ID</th>
              <th class="py-2 px-6 text-center">Valor</th>
              <th class="py-2 px-6 text-center">Nota fiscal</th>
              <th class="py-2 px-6 text-center">Chave PIX</th>
              <th class="py-2 px-6 text-center">status</th>
              <th class="py-2 px-6 text-center">Data de solicitação</th>
              <th class="py-2 px-6 text-center">Comprovante</th>
              <!-- <th class="py-2 px-6 text-center">
                            <div class="flex gap-2 justify-center items-center">
                                <p>Status da Compra</p>

                                <Popper hover :arrow="true" placement="top">
                                    <button>
                                        <Svg :svgContent="infoSvg('size-3 text-white mr-2')" />
                                    </button>
                                    <template #content>
                                        <p>Pendente: Aguardando pagamento do plano do cliente;</p>
                                        <p>
                                            Expirado: Cliente dentro do prazo de 7 dias não efetuou a compra do plano;
                                        </p>
                                        <p>Cancelada: Cliente assinou e cancelou o plano;</p>
                                        <p>Ativo: Cliente está com plano ativo.</p>
                                    </template>
                                </Popper>
                            </div>
                        </th> -->

              <th class="py-2 px-6 text-center">Data de processamento</th>
            </tr>
          </thead>
        </template>
      </MinModal>
    </div>
  </main>
</template>

<style scoped></style>
