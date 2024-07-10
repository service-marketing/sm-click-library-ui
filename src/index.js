import primarySelect from '~/components/selects/primary_select/primary_select.vue'
import simpleModal from "~/components/modals/simple_modal/simple_modal.vue"

export {
    primarySelect, simpleModal
}

function install(Vue) {
    Vue.component('primarySelect', primarySelect)
    Vue.component('simpleModal', simpleModal)
}

export default { install: install }