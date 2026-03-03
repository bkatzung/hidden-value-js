/*
 * hidden-value - Securely hide and reveal values using a shared, private key
 *	(can also just be used to confirm that another party shares a common secret
 *  without publicly exposing it)
 *
 * Requires ES2022 private fields
 *
 * Author: Brian Katzung <briank@kappacs.com>
 */

export const { hide, reveal, reveals } = (() => {
	const cls = class HiddenValue {
		#key;
		#value;

		/**
		 * Return a new key(+ optional hidden value) object
		 * @param {*} key - The revelation key
		 * @param {*} value - Optional value to be hidden
		 */
		constructor (key, value) {
			this.#key = key;
			this.#value = value;
		}

		/**
		 * Reveal an instance's value if our key matches
		 * @param {HiddenValue} hv - The hidden value to reveal
		 * @returns {*|undefined} The original value (or undefined if key is incorrrect)
		 */
		reveal (hv) {
			if (this.reveals(hv)) return hv.#value;
		}

		/**
		 * Would our key reveal an instance's hidden value?
		 * @param {HiddenValue} hv - The hidden value
		 * @returns {boolean} Whether our key matches
		 */
		reveals (hv) {
			return (hv instanceof cls && this.#key === hv.#key);
		}
	};
	Object.freeze(cls.prototype);
	return Object.freeze({
		hide: (k, v) => Object.freeze(new cls(k, v)), // Hide a value
		reveal: (k, v) => new cls(k).reveal(v), // Reveal a value
		reveals: (k, v) => new cls(k).reveals(v) // Can we reveal a value?
	});
})();
