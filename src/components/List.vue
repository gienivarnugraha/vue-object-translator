<template>
  <section id="lang-list" v-if="activeView === view">
    <div class="x" @click="activeView = 'main'">×</div>
    <ul>
      <li v-for="(list, id) in lists" :key="id" @click="$emit('selected', list)">
        {{ list }}
      </li>
    </ul>
  </section>
</template>

<script setup>
import { activeView } from "@/composables/ref";

const props = defineProps({
  view: {
    type: String,
    required: true,
  },
  lists: {
    type: Array,
    required: true,
  },
});
</script>
