<template>
    <ToBottomIcon class="to-bottom"/>
</template>

<script setup lang="ts">
import ToBottomIcon from "../assets/ToBottomIcon.vue";
</script>

<style scoped>
.to-bottom {
    position: fixed;
    bottom: 7%;
    right: 3%;
    width: 50px;
    height: 50px;
}

.to-bottom:hover {
    cursor:pointer;
}
</style>