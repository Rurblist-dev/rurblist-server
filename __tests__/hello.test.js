import { myFunction } from '../src/myModule';

test('hello world!', () => {
	expect(myFunction()).toBe('Hello, World!');
});