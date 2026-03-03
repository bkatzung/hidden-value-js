import { hide, reveal, reveals } from './hidden-value.js';

/*
 * Mock insider-state object
 * A real "secret key" might be:
 * - a protected-state object ("protected" (inheritance-based) pattern)
 *   https://github.com/bkatzung/protected-js
 * - an insider-state object ("insider" (trusted-class) pattern)
 *   https://github.com/bkatzung/insider-js
 */
const mockInsider = {}; // Mock shared insider-state object

class Base {
	#insider = mockInsider;

	called (hv) {
		const insider = this.#insider;

		console.log('called with', hv);
		console.log('revealed token', reveal(insider, hv));

		// Simple secure verification that both parties share the key
		if (!reveals(insider, hv)) throw new Error('Unauthorized call');
		// Single-use, purpose-specific auth token
		if (reveal(insider, hv)?.shift?.() !== 'called') throw new Error('Invalid/expired token');

		const random = Math.random();
		console.log('called returning hidden', random);
		return hide(insider, random);
	}
}

class Sub extends Base {
	#insider = mockInsider;

	calling () {
		const insider = this.#insider;
		const singleUseToken = hide(insider, ['called']); // Single use, specific purpose ('called')
		const result = this.called(singleUseToken);
		console.log('calling received raw result', result);
		const revealed = reveal(insider, result);
		console.log('revealed result', revealed);

		try {
			const replayResult = reveal(insider, this.called(singleUseToken));
			console.log('replay revealed result', replayResult);
		} catch (err) {
			console.log('replay failed;', err);
		}
	}
}

const s1 = new Sub();
s1.calling();
