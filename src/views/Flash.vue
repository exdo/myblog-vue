<template>

</template>

<script>
export default {
    name: 'Flash',
    data () {
        return {
        }
    },
    beforeRouteEnter (to, from, next) {
        next(vm => {
            vm.$router.replace(from.path)
        })
    }
}
</script>