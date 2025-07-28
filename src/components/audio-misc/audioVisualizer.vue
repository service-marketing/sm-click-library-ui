<template>
  <div>
    <canvas
      ref="canvas"
      width="200"
      height="40"
      class="mx-auto flex items-center rounded"
    ></canvas>
  </div>
</template>

<script>
export default {
  props: {
    audioStream: MediaStream,
  },
  data() {
    return {
      audioContext: null,
      analyser: null,
    };
  },
  mounted() {
    this.initializeAudio();
  },
  methods: {
    initializeAudio() {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");

      const source = this.audioContext.createMediaStreamSource(
        this.audioStream
      );
      source.connect(this.analyser);
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        this.analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        // const centerX = canvas.width / 2; //Centro horizontal do canvas
        const middleY = canvas.height / 2; // Centro vertical do canvas
        let x = 0;

        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, middleY);
        ctx.lineTo(canvas.width, middleY);
        ctx.stroke();

        dataArray.forEach((value) => {
          const barHeight = value;
          ctx.fillStyle = `rgb(50, ${barHeight + 100}, 50)`;
          ctx.fillRect(x, middleY - barHeight / 2, barWidth, barHeight);
          x += barWidth + 1;
        });

        if (this.audioStream.active) {
          requestAnimationFrame(draw);
        }
      };

      draw();
    },
  },
};
</script>
<style scoped>
/* Estilos opcionais para o visualizador de áudio */
</style>
