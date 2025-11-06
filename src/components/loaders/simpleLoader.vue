<template>
  <div class="flex items-center justify-center h-full">
    <span class="products-and-services_bar"></span>
    <span class="products-and-services_bar"></span>
    <span class="products-and-services_bar"></span>
  </div>
</template>

<style scoped>
.products-and-services_bar {
  display: inline-block;
  width: 3px;
  height: 20px;
  background-color: #22c55e;
  border-radius: 10px;
  animation: scale-up4 1s linear infinite;
}

.products-and-services_bar:nth-child(2) {
  height: 35px;
  margin: 0 5px;
  animation-delay: 0.25s;
}

.products-and-services_bar:nth-child(3) {
  animation-delay: 0.5s;
}

@keyframes scale-up4 {
  20% {
    background-color: #22c55e;
    transform: scaleY(1.5);
  }

  40% {
    transform: scaleY(1);
  }
}
</style>