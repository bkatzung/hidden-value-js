# hidden-value-js

Securely hide and reveal values using a shared, private key. This pattern allows you to confirm that another party shares a common secret without publicly exposing it.

## Features

- **Secure value hiding**: Hide values behind a private key that can only be revealed by parties with the matching key
- **Key verification**: Check if a key can reveal a hidden value without actually revealing it
- **Single-use tokens**: Create purpose-specific, single-use authorization tokens
- **ES2022 private fields**: Uses JavaScript private class fields for true encapsulation

## Requirements

- ES2022 or later (requires private class fields support)
- Node.js 14.6.0+ or modern browsers with ES2022 support

## Usage

### Basic Import

```javascript
import { hide, reveal, reveals } from './hidden-value.js';
```

### API

#### `hide(key, value)`

Hides a value behind a key and returns a frozen hidden value object.

- **Parameters:**
  - `key` (any): The revelation key (typically a shared secret object)
  - `value` (any): An optional value to hide
- **Returns:** A frozen `HiddenValue` object

```javascript
const secretKey = {};
const hiddenValue = hide(secretKey, "sensitive data");
```

#### `reveal(key, hiddenValue)`

Reveals a hidden value if the key matches.

- **Parameters:**
  - `key` (any): The revelation key
  - `hiddenValue` (HiddenValue): The hidden value object to reveal
- **Returns:** The original value if the key matches, `undefined` otherwise

```javascript
const secretKey = {};
const hiddenValue = hide(secretKey, "sensitive data");
const revealed = reveal(secretKey, hiddenValue); // "sensitive data"
const wrongKey = {};
const failed = reveal(wrongKey, hiddenValue); // undefined
```

#### `reveals(key, hiddenValue)`

Checks whether a key can reveal a hidden value without actually revealing it.

- **Parameters:**
  - `key` (any): The revelation key
  - `hiddenValue` (HiddenValue): The hidden value object to check
- **Returns:** `true` if the key matches, `false` otherwise

```javascript
const secretKey = {};
const hiddenValue = hide(secretKey, "sensitive data");
if (reveals(secretKey, hiddenValue)) {
  console.log("Key is valid!");
}
```

## Use Cases

### 1. Secure Method Authorization

Verify that a caller has the proper authorization without exposing the secret:

```javascript
class SecureAPI {
  #insider = {}; // Private shared secret

  secureMethod(authToken) {
    // Verify the caller has the correct key
    if (!reveals(this.#insider, authToken)) {
      throw new Error('Unauthorized');
    }
    // Process the request...
  }
}
```

### 2. Single-Use Tokens

Create purpose-specific, single-use authorization tokens:

```javascript
class TokenSystem {
  #insider = {};

  createToken(purpose) {
    return hide(this.#insider, [purpose]);
  }

  validateToken(token, expectedPurpose) {
    if (!reveals(this.#insider, token)) {
      throw new Error('Invalid token');
    }
    const uses = reveal(this.#insider, token);
    if (uses?.shift?.() !== expectedPurpose) {
      throw new Error('Invalid or expired token');
    }
    return true;
  }
}
```

### 3. Protected State Pattern

Hide internal state that should only be accessible to trusted classes:

```javascript
const insiderKey = {};

class Base {
  #insider = insiderKey;

  protectedMethod(hiddenData) {
    // Only classes with the insider key can call this
    if (!reveals(this.#insider, hiddenData)) {
      throw new Error('Access denied');
    }
    const data = reveal(this.#insider, hiddenData);
    // Process protected data...
    return hide(this.#insider, result); // Return hidden result
  }
}

class Derived extends Base {
  #insider = insiderKey;

  publicMethod() {
    const data = hide(this.#insider, "protected data");
    const result = reveal(this.#insider, this.protectedMethod(data));
	console.log(result);
  }
}
```

## Example

See [`example.js`](example.js) for a complete working example demonstrating:
- Secure method calls with hidden authorization tokens
- Single-use, purpose-specific tokens
- Replay attack prevention
- Returning hidden values from methods

## How It Works

The hidden-value pattern uses ES2022 private class fields (`#key` and `#value`) to create truly private data that cannot be accessed from outside the class. The key insight is that:

1. Private fields can only be accessed by instances of the same class
2. Two instances can compare their private fields to verify they share the same key
3. The class constructor and prototype are frozen to prevent tampering
4. Hidden value objects are frozen to prevent modification

Assuming you control the context and `Object.freeze` has not been compromised, this creates a secure channel where only parties with the matching key can reveal hidden values, without ever exposing the key or value publicly.

## Related Patterns

- **Protected pattern** (inheritance-based): https://github.com/bkatzung/protected-js
- **Insider pattern** (trusted-class): https://github.com/bkatzung/insider-js

## License

This code has been placed in the public domain by the author. See [`LICENSE`](LICENSE) file for details.

## Author

Brian Katzung <briank@kappacs.com>
