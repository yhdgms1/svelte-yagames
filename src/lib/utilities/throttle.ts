/**
 * @copyright Techlead LLC
 * @see https://learn.javascript.ru/task/throttle
 */
const throttle = <Fn extends ((...args: any[]) => any)>(fn: Fn, ms: number) => {
  let throttled = false, savedArgs: any, savedThis: any;

  function wrapper() {

    if (throttled) {
      savedArgs = arguments;
      savedThis = this;
      return;
    }

    fn.apply(this, arguments);

    throttled = true;

    setTimeout(function() {
      throttled = false;
      
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper as unknown as (...args: Parameters<Fn>) => void;
}

export { throttle }