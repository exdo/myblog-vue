<template>
    <ToTopIcon class="to-top"/>
</template>

<script setup lang="ts">
import ToTopIcon from "../assets/ToTopIcon.vue";
</script>

<style scoped>
.to-top {
    position: fixed;
    bottom: 15%;
    right: 3%;
    width: 50px;
    height: 50px;
}

.to-top:hover {
    cursor:pointer;
}
</style>