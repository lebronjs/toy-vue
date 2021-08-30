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
        this.traverse(this.template);
    }
    traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim().match(/^{{([\s\S]+)}}$/)) {
                const dataName = RegExp.$1.trim();
                this.dep.subscribe(dataName, () => {
                    node.textContent = this.data[dataName];
                });
                node.textContent = this.data[dataName];
            }
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            for (const attribute of node.attributes) {
                if (attribute.name === 'v-model') {
                    const dataName = attribute.value;
                    this.dep.subscribe(dataName, () => {
                        node.value = this.data[dataName];
                    });
                    node.value = this.data[dataName];
                    node.addEventListener('input', event => (this.data[dataName] = node.value));
                }
            }
        }
        if (node.childNodes && node.childNodes.length) {
            for (const childNode of node.childNodes) {
                this.traverse(childNode);
            }
        }
    }
}

class Dep {
    constructor() {
        this.subs = new Map();
        this.currentSub = null;
    }
    // 订阅依赖
    subscribe(key, value) {
        if (!this.subs.get(key)) {
            this.subs.set(key, []);
        }
        this.subs.get(key).push(value);
    }
    // 通知依赖
    notify(key) {
        for (const subFunc of this.subs.get(key)) {
            subFunc();
        }
    }
}

const reactive = function (object, dep) {
    const observed = new Proxy(object, {
        get(target, propKey, receiver) {
            return target[propKey];
        },
        set(target, propKey, value, receiver) {
            target[propKey] = value;
            dep.notify(propKey);
            return true;
        },
    });
    return observed;
};

export { ToyVue };
