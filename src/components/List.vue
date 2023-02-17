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

<style lang="css">
#lang-list {
  top: 100px;
  height: 100vmin;
  position: relative;
  overflow: auto;
  overflow-y: scroll;
}

#lang-list .x {
  position: fixed;
  z-index: 2;
  right: 5vmin;
  cursor: pointer;
}

#lang-list .x:hover {
  opacity: 0.6;
  animation: rotate 0.3s ease-out;
}

#lang-list ul {
  position: absolute;
  top: 400px;
  left: 0;
  right: 0;
  list-style: none;
  text-align: center;
  transform: translateY(-50%);
}

#lang-list li {
  font-size: 4.4vh;
  text-transform: uppercase;
  line-height: 2.2;
  cursor: pointer;
}

#lang-list li.active {
  color: #ffc234;
}

#lang-list li:hover {
  opacity: 0.6;
}

#lang-list .x {
  font-size: 20vmin;
  top: -2.4vmin;
}

::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
}
</style>
