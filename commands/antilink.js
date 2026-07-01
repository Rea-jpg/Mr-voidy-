// antiLinkEnabled is a global variable in index.js – we export a function
// but we can't access it directly. We'll pass it via the message handler. 
// Easiest: store it in a module, but let's just use a simple object in index.js and pass it.
// I'll restructure: export a function that receives the toggle reference.

// To keep things simple for a non‑coder, I'll put the logic inside index.js when the command is 'antilink',
// but we want a proper command file. We'll make the antilink command file export a factory
// that captures the toggle variable.

// Actually, we can attach the toggle to `sock` or use a global. I'll use global.
// In index.js, define `global.antiLinkEnabled = false;` and the command will use it.
