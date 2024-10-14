/**
 * 节流函数：在指定的间隔时间（delay）执行一次
 * @param {function} func 触发函数
 * @param {number} delay 延迟时间
 */
export function throttle(method, delay) {
    let timer = null;
    return function () {
        let context = this;
        let args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            method.apply(context, args);
        }, delay);
    }

}