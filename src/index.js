import primarySelect from '~/components/selects/primary_select/primary_select.vue'
import simpleModal from "~/components/modals/simple_modal/simple_modal.vue"
import simpleCard from "~/components/cards/simple_card/simple_card.vue";

function install(Vue) {
    Vue.component('primarySelect', primarySelect)
    Vue.component('simpleModal', simpleModal)
    Vue.component('simpleCard', simpleCard)
}

export default {
    install,
    primarySelect,
    simpleModal,
    simpleCard
}