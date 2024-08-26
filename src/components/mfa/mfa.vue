<template>
  <div
    class="text-white w-full h-full bg-base-300 items-center flex justify-center"
  >
    <section class="flex-col justify-center text-center space-y-2">
      <img
        class="w-[230px] hidden md:block h-auto mx-auto lg:w-[30%]"
        :src="sm_click_logo"
      />

      <p>Acesse seu aplicativo XPTO e informe o Token de acesso</p>

      <div class="flex gap-1 justify-center">
        <input
          class="flex-col gap-2 w-8 h-8 border border-black rounded-md"
          v-for="index in 6"
          :key="index"
          type="text"
        />
      </div>
      <p>Login realizado com sucesso, você está sendo redirecionado</p>
      <p>Codigo informado invalido</p>

      <div class="mt- text-center">ADWMTecnologia LTDA @ 2023 - 2024</div>
    </section>
  </div>
</template>

<script setup>
import { sm_click_logo } from "~/assets/imgLinks.js";
</script>