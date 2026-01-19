<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

export interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  duration?: number;
  maxLength?: number;
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 5000,
  maxLength: 150
});

const emit = defineEmits<{
  close: [];
}>();

const visible = ref(true);

const close = () => {
  visible.value = false;
  emit('close');
};

// Auto-close after duration
onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
});

const truncatedMessage = computed(() => {
  if (props.message.length <= props.maxLength) {
    return props.message;
  }
  return props.message.substring(0, props.maxLength) + '...';
});
</script>

<template>
  <Transition name="toast">
    <div 
      v-if="visible"
      :class="['toast', `toast--${type}`]"
      @click="close"
    >
      <div class="toast__content">
        <span class="toast__icon">
          <template v-if="type === 'error'">❌</template>
          <template v-else-if="type === 'success'">✅</template>
          <template v-else-if="type === 'warning'">⚠️</template>
          <template v-else>ℹ️</template>
        </span>
        <p class="toast__message" :title="message">{{ truncatedMessage }}</p>
        <button 
          class="toast__close"
          @click.stop="close"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@use "../assets/scss/components/toast.scss";
</style>
