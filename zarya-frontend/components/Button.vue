<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'cancel';
  size?: 'small' | 'medium' | 'large';
  full?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  to?: string;
  href?: string;
}>();

const component = computed(() => props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button');

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant || 'primary'}`,
  props.size === 'small' && 'btn--small',
  props.size === 'large' && 'btn--large',
  props.full && 'btn--full'
].filter(Boolean).join(' '));

const componentProps = computed(() => ({
  class: buttonClasses.value,
  disabled: props.disabled,
  ...(props.to && { to: props.to }),
  ...(props.href && { href: props.href }),
  ...(!props.to && !props.href && { type: props.type || 'button' })
}));
</script>

<template>
  <component :is="component" v-bind="componentProps">
    <slot />
  </component>
</template>

<style scoped lang="scss">
@use '~/assets/scss/components/buttons.scss';
</style>
