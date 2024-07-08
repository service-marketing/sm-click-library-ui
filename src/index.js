import primarySelect from '~/components/selects/primary_select/primary_select.vue'
export {
    primarySelect
}

function install(Vue) {
    Vue.component('primarySelect', primarySelect)
}

export default { install: install }