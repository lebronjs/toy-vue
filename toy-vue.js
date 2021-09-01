console.log('toy-vue');
console.log(
    '%c happy toy-vue 🦄',
    'padding: 0.3rem 1.5rem; font-family: Roboto; font-size: 1.2em; line-height: 1.4em; color: white; background-color: #4158D0; background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);'
);
class ToyVue {
    constructor(config) {
        this.template = document.querySelector(config.el);
        this.dep = new Dep();
        this.data = reactive(config.data, this.dep);
        this.traverseCompile(this.template);
    }
    traverseCompile(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim().match(/^{{([\s\S]+)}}$/)) {
                const dataName = RegExp.$1.trim();
                // 添加订阅者
                Watcher.target = new Watcher(() => (node.textContent = this.data[dataName]));
                // 初始化
                node.textContent = this.data[dataName];
            }
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            for (const attribute of node.attributes) {
                if (attribute.name === 'v-model') {
                    const dataName = attribute.value;
                    // 添加订阅者
                    Watcher.target = new Watcher(() => (node.value = this.data[dataName]));
                    // 初始化
                    node.value = this.data[dataName];
                    node.addEventListener('input', event => (this.data[dataName] = node.value));
                }
            }
        }
        if (node.childNodes && node.childNodes.length) {
            for (const childNode of node.childNodes) {
                this.traverseCompile(childNode);
            }
        }
    }
}

class Dep {
    constructor() {
        this.subsMap = new Map();
        this.currentSub = null;
    }
    // 订阅依赖
    subscribe(key, value) {
        if (!this.subsMap.get(key)) {
            this.subsMap.set(key, []);
        }
        this.subsMap.get(key).push(value);
    }
    // 通知依赖
    notify(key) {
        for (const sub of this.subsMap.get(key)) {
            sub.update();
        }
    }
}

class Watcher {
    static target = null;
    constructor(cb) {
        this.callBack = cb;
    }
    update() {
        this.callBack();
    }
}

const reactive = function (object, dep) {
    const observed = new Proxy(object, {
        get(target, propKey, receiver) {
            Watcher.target && dep.subscribe(propKey, Watcher.target);
            Watcher.target = null;
            return target[propKey];
        },
        set(target, propKey, value, receiver) {
            if (value === target[propKey]) return;
            target[propKey] = value;
            dep.notify(propKey);
            return true;
        },
    });
    return observed;
};

export { ToyVue };
