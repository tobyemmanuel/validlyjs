# Conditional Validation

Implement complex validation logic that depends on the values of other fields with ValidlyJS's comprehensive conditional validation rules.

## Overview

Conditional validation allows you to create dynamic validation rules that change based on the values of other fields in your data. This is essential for complex forms where certain fields become required or prohibited based on user selections.

## Required If

Make a field required when another field has a specific value:

### Fluent API

```javascript
import { Validator, string, boolean } from 'validlyjs_2';

const validator = new Validator({
  hasAddress: boolean().required(),
  address: string().requiredIf('hasAddress', true).min(10).max(255),
  
  paymentMethod: string().required().in(['credit_card', 'paypal', 'bank_transfer']),
  cardNumber: string().requiredIf('paymentMethod', 'credit_card').creditCard(),
  
  accountType: string().required().in(['personal', 'business']),
  companyName: string().requiredIf('accountType', 'business').min(2).max(100)
});

// Valid data
const result1 = await validator.validate({
  hasAddress: true,
  address: '123 Main Street, City, State',
  paymentMethod: 'credit_card',
  cardNumber: '4532-1234-5678-9012',
  accountType: 'business',
  companyName: 'Acme Corp'
});

// Also valid - address not required when hasAddress is false
const result2 = await validator.validate({
  hasAddress: false,
  paymentMethod: 'paypal',
  accountType: 'personal'
});
```

### String Format

```javascript
const validator = new Validator({
  hasAddress: 'required|boolean',
  address: 'required_if:hasAddress,true|string|min:10|max:255',
  
  paymentMethod: 'required|string|in:credit_card,paypal,bank_transfer',
  cardNumber: 'required_if:paymentMethod,credit_card|string|credit_card',
  
  accountType: 'required|string|in:personal,business',
  companyName: 'required_if:accountType,business|string|min:2|max:100'
});
```

### Array Format

```javascript
const validator = new Validator({
  hasAddress: [
    { rule: 'required' },
    { rule: 'boolean' }
  ],
  address: [
    { rule: 'required_if', parameters: ['hasAddress', true] },
    { rule: 'string' },
    { rule: 'min', parameters: [10] },
    { rule: 'max', parameters: [255] }
  ],
  paymentMethod: [
    { rule: 'required' },
    { rule: 'string' },
    { rule: 'in', parameters: ['credit_card', 'paypal', 'bank_transfer'] }
  ],
  cardNumber: [
    { rule: 'required_if', parameters: ['paymentMethod', 'credit_card'] },
    { rule: 'string' },
    { rule: 'credit_card' }
  ]
});
```

## Required Unless

Make a field required unless another field has a specific value:

```javascript
const validator = new Validator({
  loginMethod: 'required|string|in:email,phone,social',
  email: 'required_unless:loginMethod,phone|string|email',
  phone: 'required_unless:loginMethod,email|string|phone',
  
  subscriptionType: 'required|string|in:free,premium,enterprise',
  paymentInfo: 'required_unless:subscriptionType,free|string|min:10'
});

// Valid - email required because loginMethod is not 'phone'
const result1 = await validator.validate({
  loginMethod: 'email',
  email: 'user@example.com',
  subscriptionType: 'premium',
  paymentInfo: 'payment-token-123'
});

// Valid - paymentInfo not required for free subscription
const result2 = await validator.validate({
  loginMethod: 'phone',
  phone: '+1-555-123-4567',
  subscriptionType: 'free'
});
```

## Required With

Make a field required when any of the specified fields are present:

```javascript
// Shipping information - if any shipping field is provided, all are required
const validator = new Validator({
  shippingStreet: 'nullable|string|max:255',
  shippingCity: 'required_with:shippingStreet,shippingState,shippingZip|string|max:100',
  shippingState: 'required_with:shippingStreet,shippingCity,shippingZip|string|size:2',
  shippingZip: 'required_with:shippingStreet,shippingCity,shippingState|string|postal_code',
  
  // Contact information
  firstName: 'nullable|string|max:50',
  lastName: 'required_with:firstName|string|max:50',
  middleName: 'nullable|string|max:50'
});

// Valid - complete shipping address
const result1 = await validator.validate({
  shippingStreet: '123 Main St',
  shippingCity: 'Anytown',
  shippingState: 'CA',
  shippingZip: '12345'
});

// Valid - no shipping information
const result2 = await validator.validate({});

// Invalid - incomplete shipping address
const result3 = await validator.validate({
  shippingStreet: '123 Main St'
  // Missing city, state, zip
});
```

## Required With All

Make a field required only when all specified fields are present:

```javascript
const validator = new Validator({
  // Credit card information
  cardNumber: 'nullable|string|credit_card',
  expiryMonth: 'nullable|integer|between:1,12',
  expiryYear: 'nullable|integer|min:2024',
  cvv: 'required_with_all:cardNumber,expiryMonth,expiryYear|string|size:3',
  
  // Address verification
  street: 'nullable|string|max:255',
  city: 'nullable|string|max:100',
  state: 'nullable|string|size:2',
  country: 'required_with_all:street,city,state|string|size:2'
});

// Valid - complete credit card info including CVV
const result1 = await validator.validate({
  cardNumber: '4532-1234-5678-9012',
  expiryMonth: 12,
  expiryYear: 2025,
  cvv: '123'
});

// Valid - partial credit card info, CVV not required
const result2 = await validator.validate({
  cardNumber: '4532-1234-5678-9012',
  expiryMonth: 12
  // CVV not required because expiryYear is missing
});
```

## Required Without

Make a field required when any of the specified fields are missing:

```javascript
const validator = new Validator({
  // User identification - at least one must be provided
  email: 'required_without:phone,username|string|email',
  phone: 'required_without:email,username|string|phone',
  username: 'required_without:email,phone|string|min:3|max:20',
  
  // Contact preferences
  emailNotifications: 'nullable|boolean',
  smsNotifications: 'nullable|boolean',
  pushNotifications: 'required_without:emailNotifications,smsNotifications|boolean'
});

// Valid - email provided
const result1 = await validator.validate({
  email: 'user@example.com',
  pushNotifications: true
});

// Valid - phone provided
const result2 = await validator.validate({
  phone: '+1-555-123-4567',
  emailNotifications: true
});

// Invalid - no identification method provided
const result3 = await validator.validate({
  pushNotifications: true
});
```

## Required Without All

Make a field required only when all specified fields are missing:

```javascript
const validator = new Validator({
  // Social media profiles
  facebook: 'nullable|string|url',
  twitter: 'nullable|string|url',
  linkedin: 'nullable|string|url',
  website: 'required_without_all:facebook,twitter,linkedin|string|url',
  
  // Payment methods
  creditCard: 'nullable|string|credit_card',
  paypalEmail: 'nullable|string|email',
  bankAccount: 'nullable|string|min:10',
  cashOnDelivery: 'required_without_all:creditCard,paypalEmail,bankAccount|boolean|accepted'
});

// Valid - has social media profile
const result1 = await validator.validate({
  twitter: 'https://twitter.com/username'
});

// Valid - website required because no social media profiles
const result2 = await validator.validate({
  website: 'https://example.com'
});

// Invalid - no social media or website
const result3 = await validator.validate({});
```

## Prohibited Rules

Prevent fields from being present under certain conditions:

### Prohibited

```javascript
const validator = new Validator({
  userType: 'required|string|in:guest,member,admin',
  adminToken: 'prohibited|string', // Never allowed
  
  subscriptionType: 'required|string|in:free,premium',
  premiumFeatures: 'prohibited_if:subscriptionType,free|array',
  
  age: 'required|integer|min:13',
  parentalConsent: 'prohibited_unless:age,13,14,15,16,17|boolean'
});

// Valid - no prohibited fields
const result1 = await validator.validate({
  userType: 'member',
  subscriptionType: 'premium',
  premiumFeatures: ['feature1', 'feature2'],
  age: 25
});

// Invalid - prohibited field present
const result2 = await validator.validate({
  userType: 'guest',
  adminToken: 'secret-token', // This field is always prohibited
  subscriptionType: 'free',
  age: 20
});
```

## Complex Scenarios

Combine multiple conditional rules for sophisticated validation logic:

### Multi-Step Form Validation

```javascript
const validator = new Validator({
  // Step 1: Basic Information
  step: 'required|integer|in:1,2,3',
  firstName: 'required|string|min:2|max:50',
  lastName: 'required|string|min:2|max:50',
  
  // Step 2: Contact Information (required if step >= 2)
  email: 'required_if:step,2,3|string|email',
  phone: 'required_if:step,2,3|string|phone',
  
  // Step 3: Additional Details (required if step = 3)
  address: 'required_if:step,3|string|min:10|max:255',
  city: 'required_if:step,3|string|max:100',
  
  // Conditional fields based on user type
  userType: 'required_if:step,2,3|string|in:individual,business',
  companyName: 'required_if:userType,business|string|min:2|max:100',
  taxId: 'required_if:userType,business|string|min:9|max:15',
  
  // Business fields prohibited for individuals
  businessLicense: 'prohibited_if:userType,individual|string',
  employeeCount: 'prohibited_if:userType,individual|integer|min:1'
});

// Step 1 validation
const step1Result = await validator.validate({
  step: 1,
  firstName: 'John',
  lastName: 'Doe'
});

// Step 2 validation
const step2Result = await validator.validate({
  step: 2,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-555-123-4567',
  userType: 'business'
});

// Step 3 validation
const step3Result = await validator.validate({
  step: 3,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1-555-123-4567',
  userType: 'business',
  companyName: 'Acme Corp',
  taxId: '12-3456789',
  address: '123 Business Ave',
  city: 'Business City',
  businessLicense: 'BL-123456',
  employeeCount: 50
});
```

### E-commerce Order Validation

```javascript
const orderValidator = new Validator({
  // Order basics
  orderType: 'required|string|in:pickup,delivery,shipping',
  
  // Delivery address (required for delivery/shipping)
  deliveryAddress: 'required_if:orderType,delivery,shipping|string|min:10',
  deliveryCity: 'required_if:orderType,delivery,shipping|string|max:100',
  deliveryZip: 'required_if:orderType,delivery,shipping|string|postal_code',
  
  // Pickup details (required for pickup)
  pickupLocation: 'required_if:orderType,pickup|string|in:store1,store2,store3',
  pickupTime: 'required_if:orderType,pickup|string|date_format:H:i',
  
  // Shipping options (only for shipping)
  shippingMethod: 'required_if:orderType,shipping|string|in:standard,express,overnight',
  shippingInsurance: 'nullable|boolean',
  signatureRequired: 'prohibited_unless:shippingMethod,express,overnight|boolean',
  
  // Payment
  paymentMethod: 'required|string|in:cash,card,digital_wallet',
  
  // Cash payment (prohibited for shipping)
  cashAmount: 'prohibited_if:orderType,shipping|required_if:paymentMethod,cash|numeric|min:0',
  
  // Card payment details
  cardNumber: 'required_if:paymentMethod,card|string|credit_card',
  cardExpiry: 'required_if:paymentMethod,card|string|date_format:m/y',
  
  // Digital wallet
  walletId: 'required_if:paymentMethod,digital_wallet|string|min:10',
  
  // Special instructions
  giftWrap: 'nullable|boolean',
  giftMessage: 'required_if:giftWrap,true|string|max:200',
  
  // Age verification for restricted items
  hasRestrictedItems: 'required|boolean',
  ageVerification: 'required_if:hasRestrictedItems,true|boolean|accepted',
  idNumber: 'required_if:hasRestrictedItems,true|string|min:5'
});

// Pickup order with cash payment
const pickupOrder = await orderValidator.validate({
  orderType: 'pickup',
  pickupLocation: 'store1',
  pickupTime: '14:30',
  paymentMethod: 'cash',
  cashAmount: 25.99,
  hasRestrictedItems: false
});

// Shipping order with card payment and gift wrap
const shippingOrder = await orderValidator.validate({
  orderType: 'shipping',
  deliveryAddress: '123 Main Street',
  deliveryCity: 'Anytown',
  deliveryZip: '12345',
  shippingMethod: 'express',
  signatureRequired: true,
  paymentMethod: 'card',
  cardNumber: '4532-1234-5678-9012',
  cardExpiry: '12/25',
  giftWrap: true,
  giftMessage: 'Happy Birthday!',
  hasRestrictedItems: true,
  ageVerification: true,
  idNumber: 'DL123456789'
});
```

## Custom Conditional Rules

Create your own conditional validation rules for specific business logic:

```javascript
// Custom conditional rule for business hours
const requiredDuringBusinessHours = {
  validate: (value, parameters, field, data) => {
    const [timezone = 'UTC'] = parameters;
    const now = new Date();
    const hour = now.getHours();
    
    // Business hours: 9 AM to 5 PM
    const isBusinessHours = hour >= 9 && hour < 17;
    
    if (isBusinessHours) {
      return value !== undefined && value !== null && value !== '';
    }
    
    return true; // Not required outside business hours
  },
  message: 'The {field} is required during business hours (9 AM - 5 PM).',
  priority: 1
};

// Custom rule for age-based requirements
const requiredForMinors = {
  validate: (value, parameters, field, data) => {
    const [ageField = 'age'] = parameters;
    const age = parseInt(data[ageField]);
    
    if (isNaN(age)) return true; // Can't determine age
    
    if (age < 18) {
      return value !== undefined && value !== null && value !== '';
    }
    
    return true; // Not required for adults
  },
  message: 'The {field} is required for users under 18.',
  priority: 1
};

// Custom rule for subscription-based features
const requiredForPremium = {
  validate: (value, parameters, field, data) => {
    const [subscriptionField = 'subscription'] = parameters;
    const subscription = data[subscriptionField];
    
    if (subscription === 'premium' || subscription === 'enterprise') {
      return value !== undefined && value !== null && value !== '';
    }
    
    return true; // Not required for free users
  },
  message: 'The {field} is required for premium subscribers.',
  priority: 1
};

const validator = new Validator({
  supportRequest: 'required_during_business_hours|string|min:10',
  parentalConsent: 'required_for_minors:age|boolean|accepted',
  advancedFeatures: 'required_for_premium:subscriptionType|array|min:1',
  
  age: 'required|integer|min:13|max:120',
  subscriptionType: 'required|string|in:free,premium,enterprise'
}, {
  customRules: {
    required_during_business_hours: requiredDuringBusinessHours,
    required_for_minors: requiredForMinors,
    required_for_premium: requiredForPremium
  }
});
```

## Performance Tips

### Optimization Strategies

* **Rule Order:** Place conditional rules early in the validation chain
* **Field Dependencies:** Minimize cross-field dependencies for better performance
* **Early Returns:** Use early returns in custom conditional rules
* **Cache Results:** Cache expensive conditional checks when possible
* **Batch Validation:** Group related conditional validations together
* **Avoid Deep Nesting:** Keep conditional logic simple and readable

```javascript
// Optimized conditional validation
const optimizedValidator = new Validator({
  // Group related conditionals
  userType: 'required|string|in:guest,member,admin',
  
  // Use priority to control execution order
  adminFeatures: 'prohibited_unless:userType,admin|array',
  memberFeatures: 'prohibited_if:userType,guest|array',
  
  // Cache expensive operations
  subscription: 'required_if:userType,member,admin|string|in:free,premium',
  premiumFeatures: 'required_if:subscription,premium|array'
});
```
