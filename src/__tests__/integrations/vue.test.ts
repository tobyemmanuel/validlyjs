/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { useValidation } from '../../integrations/vue/composables';

// Test component for useValidation composable
const TestValidationComponent = defineComponent({
  props: {
    initialData: Object,
    rules: Object,
    options: Object,
  },
  setup(props) {
    const data = ref(props.initialData || {});
    const validation = useValidation(
      data.value,
      props.rules || {},
      props.options
    );

    return {
      data,
      ...validation,
    };
  },
  template: `
    <div>
      <div data-test="is-valid">{{ isValid }}</div>
      <div data-test="is-validating">{{ isValidating }}</div>
      <div data-test="errors">{{ JSON.stringify(errors) }}</div>
      <div data-test="has-errors">{{ hasErrors }}</div>
      <div data-test="error-count">{{ errorCount }}</div>
      <button @click="validate()" data-test="validate-all">Validate All</button>
      <button @click="validate('email')" data-test="validate-email">Validate Email</button>
      <button @click="handleChange('email', 'test@example.com')" data-test="change-email">Change Email</button>
      <button @click="handleBlur('email')" data-test="blur-email">Blur Email</button>
      <button @click="reset()" data-test="reset">Reset</button>
      <div data-test="email-error">{{ getFieldError('email') || '' }}</div>
      <div data-test="has-email-error">{{ hasFieldError('email') }}</div>
    </div>
  `,
});

describe('Vue Integration Tests', () => {
  describe('useValidation Composable', () => {
    const testData = { email: '', name: '' };
    const testRules = {
      email: 'required|string|email',
      name: 'required|string|min:2',
    };

    test('should initialize with correct default state', () => {
      const wrapper = mount(TestValidationComponent, {
        props: {
          initialData: testData,
          rules: testRules,
        },
      });

      expect(wrapper.find('[data-test="is-valid"]').text()).toBe('true');
      expect(wrapper.find('[data-test="is-validating"]').text()).toBe('false');
      expect(wrapper.find('[data-test="has-errors"]').text()).toBe('false');
      expect(wrapper.find('[data-test="error-count"]').text()).toBe('0');
    });

    test('should validate all fields', async () => {
      const wrapper = mount(TestValidationComponent, {
        props: {
          initialData: testData,
          rules: testRules,
        },
      });

      await wrapper.find('[data-test="validate-all"]').trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-test="is-valid"]').text()).toBe('false');
      expect(wrapper.find('[data-test="has-errors"]').text()).toBe('true');
    });

    test('should validate single field', async () => {
      const wrapper = mount(TestValidationComponent, {
        props: {
          initialData: testData,
          rules: testRules,
        },
      });

      await wrapper.find('[data-test="validate-email"]').trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-test="has-email-error"]').text()).toBe('true');
    });

    test('should handle field changes', async () => {
      const wrapper = mount(TestValidationComponent, {
        props: {
          initialData: testData,
          rules: testRules,
        },
      });

      await wrapper.find('[data-test="change-email"]').trigger('click');
      await wrapper.vm.$nextTick();

      // Check if isDirty is updated (would need to expose isDirty in template)
      expect(wrapper.vm.isDirty.email).toBe(true);
    });

    test('should reset validation state', async () => {
      const wrapper = mount(TestValidationComponent, {
        props: {
          initialData: testData,
          rules: testRules,
        },
      });

      // First validate to create errors
      await wrapper.find('[data-test="validate-all"]').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.find('[data-test="is-valid"]').text()).toBe('false');

      // Then reset
      await wrapper.find('[data-test="reset"]').trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('[data-test="is-valid"]').text()).toBe('true');
      expect(wrapper.find('[data-test="has-errors"]').text()).toBe('false');
    });

    test('should validate on mount when option is enabled', async () => {
      const wrapper = mount(TestValidationComponent, {
        props: {
          initialData: testData,
          rules: testRules,
          options: { validateOnMount: true }
        }
      });
      
      // Wait for multiple ticks to ensure async validation completes
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      
      // Add a small delay to ensure validation has time to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should automatically validate on mount
      expect(wrapper.find('[data-test="is-valid"]').text()).toBe('false');
    });

    // Alternative test approach - checking if validation was triggered
    test('should validate on mount when option is enabled (alternative)', async () => {
      const wrapper = mount(TestValidationComponent, {
        props: {
          initialData: testData,
          rules: testRules,
          options: { validateOnMount: true }
        }
      });
      
      // Wait for validation to complete - need multiple ticks and a timeout
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      
      // Add a small delay to ensure validation has time to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Check if errors exist (which means validation ran)
      const hasErrors = wrapper.find('[data-test="has-errors"]').text();
      const errorCount = wrapper.find('[data-test="error-count"]').text();
      
      // If validateOnMount works, we should have errors
      expect(hasErrors).toBe('true');
      expect(parseInt(errorCount)).toBeGreaterThan(0);
    });

    // Debug test to see what's happening
    test('debug validateOnMount behavior', async () => {
      const wrapper = mount(TestValidationComponent, {
        props: {
          initialData: testData,
          rules: testRules,
          options: { validateOnMount: true }
        }
      });
      
      console.log('Initial state:');
      console.log('isValid:', wrapper.find('[data-test="is-valid"]').text());
      console.log('isValidating:', wrapper.find('[data-test="is-validating"]').text());
      console.log('hasErrors:', wrapper.find('[data-test="has-errors"]').text());
      console.log('errorCount:', wrapper.find('[data-test="error-count"]').text());
      
      await wrapper.vm.$nextTick();
      
      console.log('After nextTick:');
      console.log('isValid:', wrapper.find('[data-test="is-valid"]').text());
      console.log('isValidating:', wrapper.find('[data-test="is-validating"]').text());
      console.log('hasErrors:', wrapper.find('[data-test="has-errors"]').text());
      console.log('errorCount:', wrapper.find('[data-test="error-count"]').text());
      
      // Wait a bit more
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('After timeout:');
      console.log('isValid:', wrapper.find('[data-test="is-valid"]').text());
      console.log('isValidating:', wrapper.find('[data-test="is-validating"]').text());
      console.log('hasErrors:', wrapper.find('[data-test="has-errors"]').text());
      console.log('errorCount:', wrapper.find('[data-test="error-count"]').text());
    });
  });
});