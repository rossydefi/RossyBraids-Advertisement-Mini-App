// Lets the Node server import the shared catalog (src/data/flyerData.ts) without bundling images:
// image imports resolve to an empty string on the server.
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/\.(webp|jpe?g|png|svg)$/i.test(specifier)) {
      return { url: 'asset:' + encodeURIComponent(specifier), shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith('asset:')) {
      return { format: 'module', source: 'export default "";', shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
