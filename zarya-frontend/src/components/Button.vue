<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'cancel';
  size?: 'small' | 'medium' | 'large';
  full?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  to?: string;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent]
}>();

const isDisabled = computed(() => props.disabled || props.loading);
const component = computed(() => props.to && !isDisabled.value ? RouterLink : 'button');

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant || 'primary'}`,
  props.size === 'small' && 'btn--small',
  props.size === 'large' && 'btn--large',
  props.full && 'btn--full',
  props.loading && 'btn--loading',
  isDisabled.value && 'btn--disabled'
].filter(Boolean).join(' '));

const componentProps = computed(() => ({
  class: buttonClasses.value,
  disabled: isDisabled.value,
  'aria-disabled': isDisabled.value,
  ...(props.to && !isDisabled.value && { to: props.to }),
  ...(!props.to && { type: props.type || 'button' }),
  ...(!isDisabled.value && {
    onClick: (e: MouseEvent) => emit('click', e)
  })
}));
</script>

<template>
  <component :is="component" v-bind="componentProps">
    <span v-if="loading" class="btn__spinner" aria-hidden="true"></span>
    <span :class="{ 'btn__content': loading }">
      <slot />
    </span>
  </component>
</template>

<style scoped lang="scss">
@use '../assets/scss/components/buttons.scss';
</style>
