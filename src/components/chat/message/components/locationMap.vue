<template>
    <div :id="mapId" class="min-w-[300px] rounded-md h-[300px]"></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default {
    name: "LocationMap",
    props: {
        map: { type: Object, required: true },
        mapId: { type: String, required: true }
    },
    mounted() {
        if (this._map) this._map.remove();

        const { latitude, length: lng } = this.map;
        const map = L.map(this.mapId).setView([latitude, lng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

        const pin = L.icon({
            iconUrl: "/image/location-pin.png",
            iconSize: [50, 50],
            iconAnchor: [24, 30]
        });

        L.marker([latitude, lng], { icon: pin })
            .addTo(map)
            .on("click", () => {
                const url = `https://www.google.com/maps?q=${latitude},${lng}&z=19`;
                window.open(url, "_blank");
            });

        map.attributionControl.setPrefix("");

        const container = map.getContainer();
        const scrollParent = container.closest(".scroll");

        const lockScroll = () => {
            if (scrollParent) scrollParent.style.overflowY = "hidden";
        };
        const unlockScroll = () => {
            if (scrollParent) scrollParent.style.overflowY = "auto";
        };

        container.addEventListener("mouseenter", lockScroll);
        container.addEventListener("mouseleave", unlockScroll);
        container.addEventListener("touchstart", lockScroll, { passive: false });
        container.addEventListener("touchend", unlockScroll, { passive: false });
        container.addEventListener("touchcancel", unlockScroll, { passive: false });

        this._map = map;
        this._cleanup = () => {
            container.removeEventListener("mouseenter", lockScroll);
            container.removeEventListener("mouseleave", unlockScroll);
            container.removeEventListener("touchstart", lockScroll, { passive: false });
            container.removeEventListener("touchend", unlockScroll, { passive: false });
            container.removeEventListener("touchcancel", unlockScroll, { passive: false });
            if (scrollParent) scrollParent.style.overflowY = "auto";
            map.remove();
        };
    },
    beforeUnmount() {
        this._cleanup && this._cleanup();
    }
};
</script>

<style>
.leaflet-pane {
    z-index: 10;
}
</style>
